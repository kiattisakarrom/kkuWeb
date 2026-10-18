# Git repositories

## Current repository

- Repository: https://github.com/kiattisakarrom/kkuWeb.git
- Local root: this `host` directory
- Frontend directory: `front/` (formerly `front-um/`)
- Backend directory: `back/`
- Shared deployment files: `nginx/` and `docker-compose.yml`

## Original repositories

- Frontend: https://github.com/kiattisakar/hospital-front.git
  - Original local branch: `main`
  - Original commit: `34075700e588885d5de4e37cd302a745e0d072af`
- Backend: https://github.com/kiattisakar/hospital-back.git
  - Original local branch: `main`
  - Original commit: `795702c13136d509209ae60c9700f75d09691b44`

The original GitHub repositories were not modified. Their local Git metadata
is preserved in `.git-backups/front.git/` and `.git-backups/back.git/`.
These backups are ignored by the new repository. The new repository starts
with its own history; the original histories remain available in the backups
and original GitHub repositories.

Environment files, dependencies, and local TLS certificates are ignored.
