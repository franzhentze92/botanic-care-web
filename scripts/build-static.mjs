import { cpSync, mkdirSync, rmSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const botanic = join(root, 'botanic-html');
const pub = join(root, 'public');

if (existsSync(dist)) {
  rmSync(dist, { recursive: true, force: true });
}
mkdirSync(dist, { recursive: true });

const pages = [
  { src: join(botanic, 'botanic_care_coming_soon.html'), dest: join(dist, 'index.html') },
  { src: join(botanic, 'botanic_care_home.html'),        dest: join(dist, 'home.html') },
  { src: join(botanic, 'botanic_care_shop.html'),         dest: join(dist, 'shop.html') },
  { src: join(botanic, 'botanic_care_pdp.html'),          dest: join(dist, 'product.html') },
  { src: join(botanic, 'botanic_care_aroma_lavanda.html'),dest: join(dist, 'aroma-lavanda.html') },
  { src: join(botanic, 'botanic_care_aroma_vainilla.html'),dest: join(dist, 'aroma-vainilla.html') },
  { src: join(botanic, 'botanic_care_historia.html'),     dest: join(dist, 'historia.html') },
  { src: join(botanic, 'botanic_care_contactanos.html'),  dest: join(dist, 'contactanos.html') },
];

for (const { src, dest } of pages) {
  if (existsSync(src)) {
    cpSync(src, dest);
    console.log(`[build] ${src.split(/[/\\]/).pop()} → ${dest.split(/[/\\]/).pop()}`);
  } else {
    console.warn(`[build] SKIP (not found): ${src}`);
  }
}

if (existsSync(join(pub, 'botanic-cart.js'))) {
  cpSync(join(pub, 'botanic-cart.js'), join(dist, 'botanic-cart.js'));
  console.log('[build] botanic-cart.js → dist/');
}

if (existsSync(join(pub, 'botanic-images'))) {
  cpSync(join(pub, 'botanic-images'), join(dist, 'botanic-images'), { recursive: true });
  console.log('[build] botanic-images/ → dist/');
}


console.log('\n[build] Done! Static site ready in dist/');
