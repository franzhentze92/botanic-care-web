import { copyFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const homeSrc = join(root, 'botanic-html', 'botanic_care_home.html');
const shopSrc = join(root, 'botanic-html', 'botanic_care_shop.html');
const aromaSrc = join(root, 'botanic-html', 'botanic_care_aroma_lavanda.html');
const aromaVainillaSrc = join(root, 'botanic-html', 'botanic_care_aroma_vainilla.html');
const historiaSrc = join(root, 'botanic-html', 'botanic_care_historia.html');
const pdpSrc = join(root, 'botanic-html', 'botanic_care_pdp.html');
const contactSrc = join(root, 'botanic-html', 'botanic_care_contactanos.html');
const comingSoonSrc = join(root, 'botanic-html', 'botanic_care_coming_soon.html');
const destIndex = join(root, 'index.html');
const destShop = join(root, 'public', 'shop.html');
const destAroma = join(root, 'public', 'aroma-lavanda.html');
const destAromaVainilla = join(root, 'public', 'aroma-vainilla.html');
const destHistoria = join(root, 'public', 'historia.html');
const destProduct = join(root, 'public', 'product.html');
const destContact = join(root, 'public', 'contactanos.html');
const destComingSoon = join(root, 'public', 'coming-soon.html');

if (!existsSync(homeSrc)) {
  console.warn('[copy-home-html] Skip home: not found:', homeSrc);
} else {
  copyFileSync(homeSrc, destIndex);
  console.log('[copy-home-html] Copied botanic_care_home.html → index.html');
}

if (!existsSync(shopSrc)) {
  console.warn('[copy-home-html] Skip shop: not found:', shopSrc);
} else {
  copyFileSync(shopSrc, destShop);
  console.log('[copy-home-html] Copied botanic_care_shop.html → public/shop.html');
}

if (!existsSync(aromaSrc)) {
  console.warn('[copy-home-html] Skip aroma lavanda: not found:', aromaSrc);
} else {
  copyFileSync(aromaSrc, destAroma);
  console.log('[copy-home-html] Copied botanic_care_aroma_lavanda.html → public/aroma-lavanda.html');
}

if (!existsSync(aromaVainillaSrc)) {
  console.warn('[copy-home-html] Skip aroma vainilla: not found:', aromaVainillaSrc);
} else {
  copyFileSync(aromaVainillaSrc, destAromaVainilla);
  console.log('[copy-home-html] Copied botanic_care_aroma_vainilla.html → public/aroma-vainilla.html');
}

if (!existsSync(historiaSrc)) {
  console.warn('[copy-home-html] Skip historia: not found:', historiaSrc);
} else {
  copyFileSync(historiaSrc, destHistoria);
  console.log('[copy-home-html] Copied botanic_care_historia.html → public/historia.html');
}

if (!existsSync(pdpSrc)) {
  console.warn('[copy-home-html] Skip product PDP: not found:', pdpSrc);
} else {
  copyFileSync(pdpSrc, destProduct);
  console.log('[copy-home-html] Copied botanic_care_pdp.html → public/product.html');
}

if (!existsSync(contactSrc)) {
  console.warn('[copy-home-html] Skip contact: not found:', contactSrc);
} else {
  copyFileSync(contactSrc, destContact);
  console.log('[copy-home-html] Copied botanic_care_contactanos.html → public/contactanos.html');
}

if (!existsSync(comingSoonSrc)) {
  console.warn('[copy-home-html] Skip coming soon: not found:', comingSoonSrc);
} else {
  copyFileSync(comingSoonSrc, destComingSoon);
  console.log('[copy-home-html] Copied botanic_care_coming_soon.html → public/coming-soon.html');
}
