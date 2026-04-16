import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const page = join(root, 'botanic-html', 'botanic_care_contactanos.html');
const fragment = join(dirname(fileURLToPath(import.meta.url)), 'contact-insert-fragment.html');

let s = readFileSync(page, 'utf8');
const mid = readFileSync(fragment, 'utf8');
const i0 = s.indexOf('<!-- HERO -->');
const i1 = s.indexOf('<!-- FOOTER -->');
if (i0 === -1 || i1 === -1) {
  console.error('Markers not found in', page);
  process.exit(1);
}
s = s.slice(0, i0) + mid + s.slice(i1);
writeFileSync(page, s);
console.log('[splice-contact-body] Replaced <!-- HERO -->…<!-- FOOTER --> in botanic_care_contactanos.html');
