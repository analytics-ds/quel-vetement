#!/usr/bin/env node
/* Génère les pages catégories (hubs) Quel Vêtement (FR + EN) à partir du squelette de la home.
   - réutilise le <head> (CSS + Typekit), le <header> et le <footer> de index.html / en/index.html
   - liste les articles de la catégorie en cartes (même markup que la home)
   - hreflang réciproques, canonical, CollectionPage + BreadcrumbList JSON-LD, og:image
   Idempotent : régénère les 6 pages à chaque run. */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const SITE = 'https://quel-vetement.com';

const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const homeEn = fs.readFileSync(path.join(ROOT, 'en', 'index.html'), 'utf8');
function between(src, a, b) { const i = src.indexOf(a); const j = src.indexOf(b, i); return src.slice(i, j + b.length); }
const HEADER_FR = between(home, '<header>', '</header>');
const HEADER_EN = between(homeEn, '<header>', '</header>');
const FOOTER_FR = between(home, '<footer', '</footer>');
const FOOTER_EN = between(homeEn, '<footer', '</footer>');
const STYLE = between(home, '<style>', '</style>');
const TYPEKIT = '<link rel="stylesheet" href="/__ext/use.typekit.net/bki1nqp.css">';

const HUB_CSS = `<style>
.hubhead{max-width:880px;margin:0 auto;padding:56px 28px 8px;text-align:center}
.hubhead .crumb{font-family:var(--sans);text-transform:uppercase;letter-spacing:.16em;font-size:.62rem;color:var(--muted);margin-bottom:16px}
.hubhead .crumb a{opacity:.8}.hubhead .crumb a:hover{opacity:1}
.hubhead h1{font-size:clamp(2rem,4.4vw,2.9rem);line-height:1.08;margin:.2rem 0 .9rem}
.hubhead p{max-width:680px;margin:0 auto 6px;font-size:1.04rem;color:#3a352e}
.hubgrid{max-width:1180px;margin:26px auto 0;padding:0 28px 66px}
.hubcount{font-family:var(--sans);font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);text-align:center;margin-top:14px}
</style>`;

const arts = JSON.parse(fs.readFileSync(path.join(ROOT, '_articles', 'articles.json'), 'utf8'));

const HUBS = [
  {
    slugFr: 'vetements-homme', slugEn: 'menswear',
    nameFr: 'Vêtements', nameEn: 'Clothing',
    h1Fr: 'Vêtements homme : bien choisir et bien porter ses pièces',
    h1En: "Men's clothing: choosing and wearing your pieces well",
    titleFr: 'Vêtements homme : guides pour bien les porter | Quel Vêtement',
    titleEn: "Men's clothing: style guides to wear it well | Quel Vêtement",
    descFr: "Chino, jean, polo, chemise ou cardigan : nos guides pour choisir la bonne coupe et porter chaque vêtement homme avec style, du bureau au week-end.",
    descEn: 'Chinos, jeans, polos, shirts and cardigans: our guides to picking the right fit and wearing each piece with style, from the office to the weekend.',
    introFr: "Un vestiaire masculin tient sur une poignée de pièces : un chino bien coupé, un jean brut, une chemise blanche repassée, un polo qui tombe droit, un cardigan pour la mi-saison. Le plus dur n'est pas de les acheter, c'est de les porter juste. Chaque guide de cette catégorie prend un vêtement et le passe en revue : quelle coupe selon votre silhouette, quelles couleurs privilégier, avec quoi l'associer et les erreurs qui gâchent une tenue. De quoi construire un style solide, sans suivre chaque tendance.",
    introEn: "A solid wardrobe rests on a handful of pieces: well-cut chinos, raw denim, a crisp white shirt, a polo that sits right, a cardigan for mid-season. Buying them is easy; wearing them well is the real work. Each guide in this category takes one garment and covers what matters: the right fit for your build, the colours worth picking, what to pair it with and the mistakes that ruin an outfit."
  },
  {
    slugFr: 'costume-occasions', slugEn: 'tailoring-occasions',
    nameFr: 'Costume & occasions', nameEn: 'Tailoring & occasions',
    h1Fr: 'Costume et grandes occasions : être à la hauteur',
    h1En: 'Tailoring and special occasions: dressing the part',
    titleFr: 'Costume homme & tenues de cérémonie : nos guides | Quel Vêtement',
    titleEn: "Men's tailoring & occasion outfits: our guides | Quel Vêtement",
    descFr: "Choisir un costume à sa taille, s'habiller en invité de mariage : nos guides pour les occasions où la tenue compte vraiment, sans faute de goût.",
    descEn: 'Choosing a suit that fits, dressing as a wedding guest: our guides for the occasions where your outfit really matters.',
    introFr: "Il y a des jours où la tenue ne pardonne pas : un entretien, une cérémonie, un mariage. Un costume mal ajusté se voit sur toutes les photos, une tenue d'invité mal calibrée aussi. Ces guides détaillent ce qui compte vraiment ces jours-là : l'épaule qui tombe au bon endroit, la longueur de manche, le choix du tissu selon la saison, et les codes à respecter selon le carton d'invitation. L'objectif est simple : être impeccable sans donner l'impression d'avoir trop réfléchi.",
    introEn: "Some days leave no room for error: an interview, a ceremony, a wedding. An ill-fitting suit shows in every photo, and so does a poorly judged guest outfit. These guides focus on what actually matters on those days: shoulders that sit where they should, sleeve length, the right cloth for the season, and the dress codes hiding behind the invitation."
  },
  {
    slugFr: 'accessoires-style', slugEn: 'accessories-style',
    nameFr: 'Accessoires & style', nameEn: 'Accessories & style',
    h1Fr: 'Accessoires et conseils de style au masculin',
    h1En: "Men's accessories and style advice",
    titleFr: 'Accessoires homme & conseils de style : nos guides | Quel Vêtement',
    titleEn: "Men's accessories & style advice: our guides | Quel Vêtement",
    descFr: "Sneakers blanches, montre assortie à la tenue, associations de couleurs : nos guides pour les détails qui font passer une tenue homme du correct au réussi.",
    descEn: 'White sneakers, matching your watch to your outfit, colour combinations: our guides to the details that lift an outfit from fine to sharp.',
    introFr: "Deux hommes portent le même jean et la même chemise ; l'un a l'air habillé, l'autre non. La différence se joue dans les détails : des sneakers entretenues, une montre cohérente avec le reste, des couleurs qui se répondent au lieu de se battre. Cette catégorie regroupe les guides consacrés à ces choix-là, ceux qu'on remarque rarement quand ils sont bons et toujours quand ils sont ratés. Des règles simples, applicables dès demain matin devant le placard.",
    introEn: "Two men wear the same jeans and the same shirt; one looks dressed, the other doesn't. The gap lives in the details: clean sneakers, a watch that belongs with the rest, colours that work together instead of fighting. These guides cover exactly those choices, the ones nobody notices when they're right and everybody notices when they're wrong."
  }
];

function card(a, lang) {
  const href = lang === 'fr' ? `/${a.slug}/` : `/en/${a.slugEn}/`;
  const h1 = lang === 'fr' ? a.h1Fr : a.h1En;
  const alt = lang === 'fr' ? (a.bannerAlt || a.h1Fr) : (a.bannerAltEn || a.h1En);
  return `<a class="card" href="${href}"><div class="ph"><img src="${a.banner}" alt="${alt}" loading="lazy"></div><h3>${h1}</h3></a>`;
}

function hubPage(hub, lang) {
  const list = arts.filter(a => a.hubFr === hub.slugFr).sort((x, y) => (y.date || '').localeCompare(x.date || ''));
  const self = lang === 'fr' ? `${SITE}/${hub.slugFr}/` : `${SITE}/en/${hub.slugEn}/`;
  const urlFr = `${SITE}/${hub.slugFr}/`;
  const urlEn = `${SITE}/en/${hub.slugEn}/`;
  const title = lang === 'fr' ? hub.titleFr : hub.titleEn;
  const desc = lang === 'fr' ? hub.descFr : hub.descEn;
  const h1 = lang === 'fr' ? hub.h1Fr : hub.h1En;
  const intro = lang === 'fr' ? hub.introFr : hub.introEn;
  const crumbHome = lang === 'fr' ? 'Accueil' : 'Home';
  const homeHref = lang === 'fr' ? '/' : '/en/';
  const countLabel = lang === 'fr' ? `${list.length} guides` : `${list.length} guides`;
  const ogImage = list.length ? `${SITE}${list[0].banner}` : `${SITE}/favicon.ico`;
  const header = lang === 'fr' ? HEADER_FR : HEADER_EN;
  const footer = lang === 'fr' ? FOOTER_FR : FOOTER_EN;
  const collection = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: h1, description: desc, url: self,
    inLanguage: lang === 'fr' ? 'fr-FR' : 'en-US',
    isPartOf: { '@type': 'WebSite', name: 'Quel Vêtement', url: `${SITE}/` },
    hasPart: list.map(a => ({ '@type': 'BlogPosting', headline: lang === 'fr' ? a.h1Fr : a.h1En, url: lang === 'fr' ? `${SITE}/${a.slug}/` : `${SITE}/en/${a.slugEn}/` }))
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: crumbHome, item: lang === 'fr' ? `${SITE}/` : `${SITE}/en/` },
      { '@type': 'ListItem', position: 2, name: lang === 'fr' ? hub.nameFr : hub.nameEn, item: self }
    ]
  };
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${self}">
<link rel="alternate" hreflang="fr" href="${urlFr}">
<link rel="alternate" hreflang="en" href="${urlEn}">
<link rel="alternate" hreflang="x-default" href="${urlFr}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="${self}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${TYPEKIT}
<style>${STYLE}</style>
${HUB_CSS}
<script type="application/ld+json">
${JSON.stringify(collection, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
</script>
</head>
<body>
${header}
<main>
  <div class="hubhead">
    <div class="crumb"><a href="${homeHref}">${crumbHome}</a> &nbsp;/&nbsp; ${lang === 'fr' ? hub.nameFr : hub.nameEn}</div>
    <h1>${h1}</h1>
    <p>${intro}</p>
    <div class="hubcount">${countLabel}</div>
  </div>
  <div class="hubgrid"><div class="grid">
${list.map(a => '    ' + card(a, lang)).join('\n')}
  </div></div>
</main>
${footer}
</body>
</html>
`;
}

for (const hub of HUBS) {
  const dirFr = path.join(ROOT, hub.slugFr);
  const dirEn = path.join(ROOT, 'en', hub.slugEn);
  fs.mkdirSync(dirFr, { recursive: true });
  fs.mkdirSync(dirEn, { recursive: true });
  fs.writeFileSync(path.join(dirFr, 'index.html'), hubPage(hub, 'fr'));
  fs.writeFileSync(path.join(dirEn, 'index.html'), hubPage(hub, 'en'));
  const n = arts.filter(a => a.hubFr === hub.slugFr).length;
  console.log(`hub ${hub.slugFr} / en/${hub.slugEn} : ${n} articles`);
}
console.log('Hubs générés.');
