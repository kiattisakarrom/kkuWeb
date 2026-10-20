const fs = require("node:fs/promises");
const path = require("node:path");

// Resolve only names found inside the configured drug-picture directory. No
// browser path, URL, barcode or patient identifier can become a filesystem path.
async function readCheckoutImages(
  items,
  packets,
  directory = process.env.CHECKOUT_DRUG_IMAGE_DIR ||
    path.join(__dirname, "../assets/checkout-drugs"),
) {
  let names;
  try {
    names = await fs.readdir(directory);
  } catch {
    return { byDrug: {}, sources: {} };
  }
  const files = new Map(
    names
      .filter((n) => /\.(jpg|png)$/i.test(n))
      .map((n) => [n.toLowerCase(), n]),
  );
  const cache = new Map();
  const sources = Object.create(null);
  const read = async (name) => {
    const actual = files.get(name.toLowerCase());
    if (!actual) return "";
    if (!cache.has(actual))
      cache.set(
        actual,
        (async () => {
          try {
            const data = await fs.readFile(path.join(directory, actual));
            sources[actual] =
              `data:image/${/\.png$/i.test(actual) ? "png" : "jpeg"};base64,${data.toString("base64")}`;
            return actual;
          } catch {
            return "";
          }
        })(),
      );
    return cache.get(actual);
  };
  const images = Object.create(null);
  for (const code of new Set(items.map((r) => String(r.orderitemcode ?? "")))) {
    if (!code || /[/\\\x00]/.test(code)) continue;
    const doses = new Set([
      "",
      ...packets
        .filter((p) => String(p.orderitemcode) === code)
        .map((p) => String(p.dosage)),
    ]);
    images[code] = {};
    for (const dose of doses) {
      const suffix = dose === "0.25" ? "014" : dose === "0.5" ? "012" : "011";
      images[code][dose] =
        (await read(`${code}.jpg`)) ||
        (await read(`${code}_000_${suffix}.png`)) ||
        (await read("no_picture.png"));
    }
  }
  // The same fallback/JPG may be used by dozens of drugs/doses. Transfer its
  // bytes once per response rather than repeating Base64 for every cell.
  return { byDrug: images, sources };
}
module.exports = { readCheckoutImages };
