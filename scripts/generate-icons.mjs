import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SVG_PATH = join(ROOT, 'public', 'icon.svg');
const OUT_DIR = join(ROOT, 'public', 'icons');

const SIZES = [48, 72, 96, 144, 192, 512];
const MASKABLE_SIZES = [192, 512];

await mkdir(OUT_DIR, { recursive: true });

// Generate standard icons
for (const size of SIZES) {
  await sharp(SVG_PATH)
    .resize(size, size)
    .png()
    .toFile(join(OUT_DIR, `icon-${size}.png`));
  console.log(`Created icon-${size}.png`);
}

// Generate maskable icons (20% padding for safe zone)
for (const size of MASKABLE_SIZES) {
  const innerSize = Math.round(size * 0.8);
  const padding = Math.round(size * 0.1);

  // Render the SVG at the inner size, then composite onto a padded background
  const innerIcon = await sharp(SVG_PATH)
    .resize(innerSize, innerSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 37, g: 99, b: 235, alpha: 1 } // #2563eb
    }
  })
    .composite([{ input: innerIcon, left: padding, top: padding }])
    .png()
    .toFile(join(OUT_DIR, `maskable-${size}.png`));
  console.log(`Created maskable-${size}.png`);
}

console.log('All icons generated!');
