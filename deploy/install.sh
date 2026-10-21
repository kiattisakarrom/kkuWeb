#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
DOMAIN=phramcare.kkh.go.th
HTTP_PORT=8080
BACKEND_ENV_FILE="$ROOT/back/.env"
DRUG_IMAGE_HOST_DIR="$ROOT/back/assets/checkout-drugs"
APP_VERSION=$(date -u +%Y%m%dT%H%M%SZ)
REPLACE_LEGACY=0
SKIP_BUILD=0

usage() {
    cat <<'EOF'
Usage: sudo bash deploy/install.sh [options]
  --domain NAME       Existing domain (default: phramcare.kkh.go.th)
  --port NUMBER       Loopback frontend port (default: 8080)
  --env-file FILE     Backend credentials (default: back/.env)
  --drug-images DIR   Read-only drug-picture folder (default: bundled pictures)
  --replace-legacy    Back up, then remove ONLY the old supreme project's
                      nginx/frontend/backend containers and their image tags
  --skip-build        Reuse images tagged with --version instead of building
  --version TAG       Docker image tag (default: current UTC timestamp)
  --help              Show this help

Existing Ubuntu Nginx and the hospital's HTTPS/domain setup are reused.
No database migration or business-data writes are performed by this installer.
EOF
}

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
expect_status() {
    local expected=$1 url=$2 host=$3 status attempt
    # nginx reload sends HUP; old workers can briefly answer after it returns.
    for attempt in {1..20}; do
        status=$(curl --silent --show-error --max-time 5 -H "Host: $host" -H 'Connection: close' --output /dev/null --write-out '%{http_code}' "$url") || status=000
        [[ $status == "$expected" ]] && return 0
        sleep 1
    done
    printf 'HTTP check failed: expected %s, received %s (%s)\n' "$expected" "$status" "$url" >&2
    return 1
}
while (($#)); do
    case "$1" in
        --domain|--port|--env-file|--drug-images|--version)
            (($# >= 2)) || die "Missing value for $1"
            case "$1" in
                --domain) DOMAIN=$2;;
                --port) HTTP_PORT=$2;;
                --env-file) BACKEND_ENV_FILE=$2;;
                --drug-images) DRUG_IMAGE_HOST_DIR=$2;;
                --version) APP_VERSION=$2;;
            esac
            shift 2;;
        --replace-legacy) REPLACE_LEGACY=1; shift;;
        --skip-build) SKIP_BUILD=1; shift;;
        --help) usage; exit 0;;
        *) die "Unknown option: $1";;
    esac
done

[[ $EUID -eq 0 ]] || die "Run with sudo: sudo bash deploy/install.sh"
[[ $DOMAIN =~ ^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$ ]] || die "Invalid domain"
[[ $HTTP_PORT =~ ^[0-9]{1,5}$ ]] || die "Invalid port"
HTTP_PORT=$((10#$HTTP_PORT))
((HTTP_PORT >= 1024 && HTTP_PORT <= 65535)) || die "Use a port from 1024 to 65535"
[[ $APP_VERSION =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$ ]] || die "Invalid image tag"
for tool in docker nginx curl python3 tar gzip systemctl realpath; do
    command -v "$tool" >/dev/null || die "Required program is missing: $tool"
done
docker info >/dev/null
if docker compose version >/dev/null 2>&1; then
    COMPOSE_COMMAND=(docker compose)
elif command -v docker-compose >/dev/null && docker-compose version --short | grep -qE '^v?2\.'; then
    COMPOSE_COMMAND=(docker-compose)
else
    die "Docker Compose v2 is required (plugin or docker-compose standalone)"
fi
[[ -f $BACKEND_ENV_FILE ]] || die "Create back/.env from back/.env.example and fill in credentials"
BACKEND_ENV_FILE=$(realpath -- "$BACKEND_ENV_FILE")
DRUG_IMAGE_HOST_DIR=$(realpath -e -- "$DRUG_IMAGE_HOST_DIR")
[[ -d $DRUG_IMAGE_HOST_DIR ]] || die "Drug-picture folder does not exist"
chmod 600 "$BACKEND_ENV_FILE"
python3 - "$BACKEND_ENV_FILE" <<'PY'
import re,sys
from pathlib import Path
values={}
for line in Path(sys.argv[1]).read_text(encoding='utf-8-sig').splitlines():
    match=re.match(r'\s*([A-Z_]+)\s*=\s*(.*)',line)
    if match:
        values[match[1]]=match[2].strip().strip('\"\x27')
required=['USER_SUPREAM','PASSWORD_SUPREAM','SERVER_SUPREAM','DATABASE_SUPREAM','JWT_SECRET']
missing=[key for key in required if not values.get(key)]
if missing:
    raise SystemExit('Missing environment settings: '+', '.join(missing))
PY
export APP_VERSION HTTP_PORT BACKEND_ENV_FILE DRUG_IMAGE_HOST_DIR
COMPOSE=("${COMPOSE_COMMAND[@]}" --project-name pharmcare --file "$ROOT/docker-compose.yml")
"${COMPOSE[@]}" config --quiet
systemctl is-active --quiet nginx || die "Existing Ubuntu nginx service must be running"

STATE_DIR=/var/lib/pharmcare-deploy
BACKUP_DIR="/web_data/pharmcare-backups/$APP_VERSION-$$"
[[ -d /web_data ]] || BACKUP_DIR="/var/backups/pharmcare/$APP_VERSION-$$"
install -d -m 700 "$STATE_DIR" "$BACKUP_DIR"
if [[ -f $STATE_DIR/compose.current.yml ]]; then
    cp -p "$STATE_DIR/compose.current.yml" "$BACKUP_DIR/compose.previous.yml"
fi
NGINX_PATHS=(sites-available/pharmcare sites-enabled/pharmcare sites-enabled/default)
for rel in "${NGINX_PATHS[@]}"; do
    [[ ! -d /etc/nginx/$rel || -L /etc/nginx/$rel ]] || die "Unexpected directory: /etc/nginx/$rel"
    install -d -m 700 "$BACKUP_DIR/nginx/$(dirname "$rel")"
    if [[ -e /etc/nginx/$rel || -L /etc/nginx/$rel ]]; then
        cp -a "/etc/nginx/$rel" "$BACKUP_DIR/nginx/$rel"
    fi
done

NGINX_CHANGED=0
APP_CHANGED=0
rollback() {
    local result=$?
    trap - ERR
    set +e
    printf '\nInstallation failed. Restoring the previous deployment. Backup: %s\n' "$BACKUP_DIR" >&2
    if ((NGINX_CHANGED)); then
        for rel in "${NGINX_PATHS[@]}"; do
            rm -f -- "/etc/nginx/$rel"
            if [[ -e $BACKUP_DIR/nginx/$rel || -L $BACKUP_DIR/nginx/$rel ]]; then
                cp -a "$BACKUP_DIR/nginx/$rel" "/etc/nginx/$rel"
            fi
        done
        nginx -t && systemctl reload nginx
    fi
    if ((APP_CHANGED)); then
        if [[ -f $BACKUP_DIR/compose.previous.yml ]]; then
            "${COMPOSE_COMMAND[@]}" --project-name pharmcare --file "$BACKUP_DIR/compose.previous.yml" up -d --no-build --wait --wait-timeout 120
        else
            "${COMPOSE[@]}" down
        fi
    fi
    exit "$result"
}
trap rollback ERR

printf 'Building release %s\n' "$APP_VERSION"
if ((!SKIP_BUILD)); then
    "${COMPOSE[@]}" build --pull
fi
printf '\nChecking database connections (SELECT 1 only)\n'
"${COMPOSE[@]}" run --rm --no-deps backend node scripts/check-connections.js

legacy_names=()
legacy_images=()
if ((REPLACE_LEGACY)); then
    for name in nginx frontend backend; do
        if docker container inspect "$name" >/dev/null 2>&1; then
            project=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' "$name")
            if [[ $project == supreme ]]; then
                # Unknown data volumes must never be removed by a generic installer.
                volumes=$(docker inspect --format '{{range .Mounts}}{{if eq .Type "volume"}}{{.Name}} {{end}}{{end}}' "$name")
                [[ -z $volumes ]] || die "Legacy container $name has persistent volumes; back them up separately first"
                legacy_names+=("$name")
                legacy_images+=("$(docker inspect --format '{{.Config.Image}}' "$name")")
            fi
        fi
    done
    if ((${#legacy_names[@]})); then
        printf '\nBacking up old container definitions and images\n'
        docker inspect "${legacy_names[@]}" > "$BACKUP_DIR/legacy-containers.json"
        mapfile -t legacy_images < <(printf '%s\n' "${legacy_images[@]}" | sort -u)
        docker image save "${legacy_images[@]}" | gzip > "$BACKUP_DIR/legacy-images.tar.gz"
    fi
fi

printf '\nStarting new containers on loopback port %s\n' "$HTTP_PORT"
APP_CHANGED=1
"${COMPOSE[@]}" up -d --no-build --wait --wait-timeout 120
curl --fail --silent --show-error --max-time 10 "http://127.0.0.1:$HTTP_PORT/healthz" >/dev/null
status=$(curl --silent --show-error --max-time 15 --output /dev/null --write-out '%{http_code}' "http://127.0.0.1:$HTTP_PORT/api/login-options")
[[ $status == 200 ]] || { printf 'Login-options check failed: HTTP %s\n' "$status" >&2; false; }

printf '\nConfiguring existing Ubuntu Nginx\n'
sed -e "s/__DOMAIN__/$DOMAIN/g" -e "s/__HTTP_PORT__/$HTTP_PORT/g" "$ROOT/nginx/nginx.conf" > "$BACKUP_DIR/nginx-new.conf"
NGINX_CHANGED=1
install -m 644 "$BACKUP_DIR/nginx-new.conf" /etc/nginx/sites-available/pharmcare
ln -sfn /etc/nginx/sites-available/pharmcare /etc/nginx/sites-enabled/pharmcare
rm -f -- /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
expect_status 200 http://127.0.0.1/healthz "$DOMAIN"
expect_status 401 http://127.0.0.1/api/auth "$DOMAIN"
expect_status 200 http://127.0.0.1/api/login-options "$DOMAIN"
"${COMPOSE[@]}" config > "$STATE_DIR/compose.current.yml.new"
mv -f "$STATE_DIR/compose.current.yml.new" "$STATE_DIR/compose.current.yml"
printf '%s\n' "$BACKUP_DIR" > "$STATE_DIR/last-backup"
printf '%s\n' "$APP_VERSION" > "$STATE_DIR/version"
trap - ERR

if ((${#legacy_names[@]})); then
    printf '\nRemoving backed-up legacy containers\n'
    docker rm -f "${legacy_names[@]}"
    for image in "${legacy_images[@]}"; do
        docker image rm "$image" || printf 'Image retained because it is still referenced: %s\n' "$image"
    done
fi
printf '\nInstalled: https://%s\nRelease: %s\nBackup: %s\n' "$DOMAIN" "$APP_VERSION" "$BACKUP_DIR"
"${COMPOSE[@]}" ps
