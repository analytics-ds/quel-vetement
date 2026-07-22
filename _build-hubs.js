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
.seotext{max-width:820px;margin:0 auto;padding:8px 28px 60px}
.seotext h2{font-size:1.55rem;margin:40px 0 12px}
.seotext h3{font-size:1.12rem;margin:24px 0 8px}
.seotext p{margin:0 0 1rem;color:#26221c;font-size:1.02rem}
.seotext a{text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1px}
.seotext a:hover{color:var(--muted)}
.seotext strong{font-weight:600}
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
    introFr: "On a tous ce jean qui ne sort jamais du placard et ce polo acheté en promo qu'on ne remet pas. Cette rubrique existe pour éviter les prochains. Chaque guide prend un vêtement du quotidien et répond aux questions qu'on se pose en cabine : quelle coupe pour ma silhouette, quelle matière tient la journée, avec quoi je le porte lundi. Rien sur les tendances de la saison, tout sur les pièces qu'on garde.",
    introEn: "We all own that pair of jeans that never leaves the wardrobe, and that sale-rack polo we never wear twice. This section exists to prevent the next ones. Each guide takes one everyday garment and answers the fitting-room questions: which cut for my build, which fabric lasts the day, what do I wear it with on Monday. Nothing about this season's trends, everything about the pieces you keep.",
    sectionsFr: `<h2>Huit cintres suffisent</h2>
<p>Faites le test un dimanche : sortez du placard ce que vous avez vraiment porté ce mois-ci. Chez la plupart des hommes, il reste un <a href="/comment-porter-un-chino-homme/">chino</a>, un <a href="/comment-porter-un-jean-homme/">jean</a>, deux chemises dont la <a href="/comment-porter-une-chemise-blanche-homme/">blanche</a>, un <a href="/comment-porter-un-polo-homme/">polo</a> fatigué et un <a href="/comment-porter-un-cardigan-homme/">cardigan</a> qu'on ressort dès octobre. Le reste dort. Autant investir dans ces huit cintres-là et les choisir <strong>à la bonne taille</strong>, parce qu'un chino à 45 euros bien ajusté habillera toujours mieux qu'une veste de créateur qui flotte aux épaules.</p>
<h2>Ce qu'on regarde avant d'acheter</h2>
<p>Dans nos guides, la coupe passe en premier. Pas celle du mannequin de la fiche produit, la vôtre : largeur d'épaules, longueur de jambe, tour de cuisse si vous pédalez. Vient ensuite la matière, et là le toucher ne ment pas. Un coton fin qui se froisse dans le sac ne survivra pas à un été, quand un <a href="/comment-porter-une-chemise-en-lin-homme/">lin lavé</a> assume ses plis avec panache. Pour les couleurs, on garde une position simple depuis le premier article : du marine, de l'écru, du gris et de l'olive en base, et une pièce colorée à la fois. Le détail de la méthode est dans le guide des <a href="/comment-associer-les-couleurs-de-ses-vetements/">associations de couleurs</a>.</p>`,
    sectionsEn: `<h2>Eight hangers are enough</h2>
<p>Try this on a Sunday: pull out of the wardrobe what you actually wore this month. For most men, that leaves <a href="/en/how-to-wear-chinos-men/">chinos</a>, <a href="/en/how-to-wear-jeans-men/">jeans</a>, two shirts including the <a href="/en/how-to-wear-a-white-shirt-men/">white one</a>, a tired <a href="/en/how-to-wear-a-polo-shirt-men/">polo</a> and the <a href="/en/how-to-wear-a-cardigan-men/">cardigan</a> that comes back out in October. The rest sleeps. Better to invest in those eight hangers and get them <strong>in the right size</strong>, because well-fitted 45-euro chinos will always dress you better than a designer jacket floating off your shoulders.</p>
<h2>What we check before buying</h2>
<p>In our guides, fit comes first. Not the model's fit on the product page, yours: shoulder width, leg length, thigh room if you cycle. Fabric comes next, and touch doesn't lie. A thin cotton that creases in the bag won't survive a summer, while <a href="/en/how-to-wear-a-linen-shirt-men/">washed linen</a> carries its wrinkles with some swagger. On colour we've held the same line since the first article: navy, ecru, grey and olive as a base, one coloured piece at a time. The full method sits in the <a href="/en/how-to-match-colours-in-an-outfit/">colour matching</a> guide.</p>`,
    faqFr: [
      {q:"Quels vêtements posséder en priorité dans un vestiaire homme ?", a:"Un chino beige ou marine, un jean brut, une chemise blanche, un polo uni, un cardigan et une paire de sneakers propres couvrent la majorité des situations, du bureau au week-end. Mieux vaut peu de pièces bien coupées qu'une armoire pleine : chacun de nos guides détaille la coupe et la matière à privilégier pour chaque pièce."},
      {q:"Comment savoir si un vêtement est à la bonne taille ?", a:"Regardez d'abord la couture d'épaule : elle doit finir pile à l'angle de l'os, ni avant ni après. Ensuite glissez une main à plat entre le tissu et le corps ; si un poing passe, c'est trop grand. Et si vous hésitez entre deux tailles, prenez la plus ajustée : un retoucheur sait reprendre un vêtement près du corps, pas en inventer."}
    ],
    faqEn: [
      {q:"Which pieces should a wardrobe start with?", a:"Beige or navy chinos, raw denim, a white shirt, a plain polo, a cardigan and a clean pair of sneakers cover most situations from office to weekend. A few well-cut pieces beat a full wardrobe: each of our guides details the fit and fabric to look for."},
      {q:"How do I know a garment fits?", a:"Start with the shoulder seam: it should end exactly at the corner of the bone, no sooner, no later. Then slide a flat hand between fabric and body; if a fist fits, it's too big. And when torn between two sizes, take the closer fit: a tailor can take a garment in, not invent one."}
    ],
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
    introFr: "Un costume s'achète rarement un mardi sans raison. Il y a un entretien derrière, une cérémonie, un mariage au mois de juin. Et le jour venu, tout se voit : l'épaule qui dépasse, la manche trop longue, la veste boutonnée qui tire. Ces guides servent à arriver préparé, avec un costume à sa taille et une tenue d'invité qui respecte les codes du carton d'invitation, sans avoir l'air d'y avoir passé la semaine.",
    introEn: "Nobody buys a suit on a random Tuesday. There's an interview behind it, a ceremony, a June wedding. And on the day, everything shows: the overhanging shoulder, the sleeve running long, the buttoned jacket pulling. These guides are for arriving prepared, in a suit that fits and a guest outfit that respects the invitation, without looking like it took you all week.",
    sectionsFr: `<h2>Un costume qui va, ça se vérifie en cabine</h2>
<p>L'erreur classique consiste à juger un costume de face, immobile, dans le miroir de la boutique. Bougez. Levez les bras, asseyez-vous, boutonnez la veste : si le bouton tire, si la couture d'épaule dépasse l'os, si le col s'écarte de la chemise, changez de taille ou de coupe. Notre guide pour <a href="/comment-choisir-un-costume-homme/">choisir un costume homme</a> reprend ces vérifications une à une, du prêt-à-porter à la demi-mesure. Et pour un premier costume, prenez du <strong>marine ou du gris moyen</strong>. Le noir, presque tout le monde l'achète en premier, presque tout le monde le regrette : il ne sert qu'en soirée très habillée.</p>
<h2>Invité à un mariage, pas figurant</h2>
<p>Un mariage en juillet à 15 heures dans un jardin et un mariage en novembre dans une mairie de centre-ville n'appellent pas la même tenue, et c'est tout le propos de notre guide de <a href="/comment-s-habiller-pour-un-mariage-homme/">l'invité de mariage</a> : costume clair, <a href="/comment-porter-une-chemise-en-lin-homme/">chemise en lin</a> et mocassins soignés pour le premier, laine plus dense et couleurs profondes pour le second. Dans les deux cas, gardez les chaussures impeccables et le poignet discret. Sur ce dernier point, le guide de la <a href="/quelle-montre-porter-selon-sa-tenue/">montre selon la tenue</a> vous évitera le chrono de sport sur le costume trois-pièces.</p>`,
    sectionsEn: `<h2>A suit that fits proves it in the fitting room</h2>
<p>The classic mistake is judging a suit head-on, standing still, in the shop mirror. Move. Raise your arms, sit down, button the jacket: if the button pulls, if the shoulder seam overshoots the bone, if the collar gaps from the shirt, change size or cut. Our guide to <a href="/en/how-to-choose-a-suit-men/">choosing a suit</a> runs through these checks one by one, from ready-to-wear to made-to-measure. And for a first suit, go <strong>navy or mid-grey</strong>. Black is the one almost everyone buys first and almost everyone regrets: it only earns its keep at very formal evening events.</p>
<h2>Wedding guest, not an extra</h2>
<p>A July wedding at 3pm in a garden and a November wedding at a city-centre registry office don't call for the same outfit, which is the whole point of our <a href="/en/how-to-dress-for-a-wedding-men/">wedding guest guide</a>: light suit, <a href="/en/how-to-wear-a-linen-shirt-men/">linen shirt</a> and polished loafers for the first, denser wool and deeper colours for the second. Either way, keep the shoes immaculate and the wrist quiet. On that last point, the guide to <a href="/en/which-watch-with-which-outfit/">matching a watch to an outfit</a> will save you from the sports chrono on a three-piece suit.</p>`,
    faqFr: [
      {q:"Quelle couleur de costume choisir en premier ?", a:"Le marine, sans hésiter, puis un gris moyen quand le premier est amorti. À eux deux ils couvrent l'entretien, le mariage et le bureau habillé, et tolèrent à peu près toutes les chemises. Résistez au noir : il paraît passe-partout en boutique et se retrouve cantonné aux enterrements et aux galas une fois chez vous."},
      {q:"Peut-on porter un costume sans cravate à un mariage ?", a:"Oui, si le carton d'invitation n'impose pas de tenue formelle. Col ouvert soigné, pochette et chaussures impeccables compensent l'absence de cravate. En cérémonie religieuse ou en soirée habillée, la cravate ou le nœud papillon restent plus sûrs : notre guide de l'invité détaille les codes selon le type de mariage."}
    ],
    faqEn: [
      {q:"Which suit colour should come first?", a:"Navy, no hesitation, then a mid-grey once the first has earned its keep. Between them they cover the interview, the wedding and the dressed-up office, and tolerate nearly any shirt. Resist black: it looks versatile in the shop and ends up reserved for funerals and galas once it's home."},
      {q:"Can you wear a suit without a tie to a wedding?", a:"Yes, when the invitation doesn't impose formal dress. A neat open collar, a pocket square and immaculate shoes make up for the missing tie. For a religious ceremony or a formal evening, a tie or bow tie stays the safer call."}
    ],
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
    introFr: "Des sneakers jaunies ruinent un costume, une montre de plongée écrase une chemise fine, et un pull bordeaux sur un pantalon rouille pique les yeux. Voilà le genre de détails dont s'occupe cette rubrique. On y parle chaussures, montres et couleurs, avec des repères assez simples pour être appliqués un matin de semaine, avant le café.",
    introEn: "Yellowed sneakers ruin a suit, a dive watch crushes a fine shirt, and a burgundy jumper over rust trousers hurts the eyes. That's the kind of detail this section deals with. Shoes, watches and colours, with rules simple enough to apply on a weekday morning, before coffee.",
    sectionsFr: `<h2>On juge un homme à ses chaussures, paraît-il</h2>
<p>Le dicton est injuste, mais il dit quelque chose de vrai : les finitions se remarquent. Une paire de <a href="/comment-porter-des-sneakers-blanches-homme/">sneakers blanches</a> nette suffit à réveiller un <a href="/comment-porter-un-jean-homme/">jean</a> et un t-shirt, et une <a href="/quelle-montre-porter-selon-sa-tenue/">montre accordée à la tenue</a> fait le reste sans un mot. L'inverse marche aussi, hélas. Le costume le mieux coupé du monde ne survit pas à des baskets jaunies. Bonne nouvelle : <strong>l'entretien coûte moins cher que le rachat</strong>, et nos guides expliquent lequel faire quand.</p>
<h2>Les couleurs, sans roue chromatique</h2>
<p>Pas besoin de théorie pour s'habiller assorti. Le guide des <a href="/comment-associer-les-couleurs-de-ses-vetements/">associations de couleurs</a> tient en quelques réflexes : une base de marine, de gris, d'écru ou d'olive, une seule pièce forte à la fois, et les cuirs qui vont ensemble, ceinture comprise. Essayez aussi le camaïeu de bleus, marine profond sur bleu moyen : c'est la combinaison la plus dure à rater du vestiaire masculin. Ces réflexes servent partout, des <a href="/vetements-homme/">vêtements du quotidien</a> au <a href="/costume-occasions/">costume des grands jours</a>.</p>`,
    sectionsEn: `<h2>You can tell a man by his shoes, they say</h2>
<p>The saying is unfair, but it points at something true: finishing touches get noticed. A crisp pair of <a href="/en/how-to-wear-white-sneakers-men/">white sneakers</a> is enough to wake up <a href="/en/how-to-wear-jeans-men/">jeans</a> and a t-shirt, and a <a href="/en/which-watch-with-which-outfit/">watch that belongs with the outfit</a> does the rest without a word. The reverse works too, sadly. The best-cut suit in the world doesn't survive yellowed trainers. The good news: <strong>upkeep costs less than replacing</strong>, and our guides explain what to do when.</p>
<h2>Colours, without the colour wheel</h2>
<p>You don't need theory to dress matched. The <a href="/en/how-to-match-colours-in-an-outfit/">colour matching guide</a> boils down to a few reflexes: a base of navy, grey, ecru or olive, one bold piece at a time, and leathers that agree with each other, belt included. Try tonal blues too, deep navy over mid blue: the hardest combination to get wrong in menswear. These reflexes work everywhere, from <a href="/en/menswear/">everyday clothing</a> to the <a href="/en/tailoring-occasions/">big-day suit</a>.</p>`,
    faqFr: [
      {q:"Quelles sneakers blanches privilégier avec une tenue habillée ?", a:"Un modèle en cuir lisse, à semelle fine et sans logo apparent. La sobriété fait tout : coutures ton sur ton, lacets propres, semelle immaculée. Avec un chino ou un pantalon de costume décontracté, elles remplacent le derby sans casser la silhouette, à condition d'un entretien régulier."},
      {q:"Faut-il assortir sa montre à sa ceinture et ses chaussures ?", a:"Le bracelet cuir suit la couleur des autres cuirs de la tenue, marron avec marron, noir avec noir. Un bracelet acier ou textile s'affranchit de cette règle et se choisit selon le registre de la tenue : acier poli en contexte habillé, NATO ou caoutchouc en tenue décontractée."}
    ],
    faqEn: [
      {q:"Which white sneakers work with dressed-up outfits?", a:"A smooth leather pair with a thin sole and no visible logo. Sobriety does the work: tone-on-tone stitching, clean laces, immaculate sole. With chinos or relaxed suit trousers they replace derbies without breaking the line, provided they are kept clean."},
      {q:"Should the watch match belt and shoes?", a:"A leather strap follows the other leathers in the outfit, brown with brown, black with black. A steel or fabric strap is free of that rule and follows the register of the outfit instead: polished steel when dressed up, NATO or rubber when casual."}
    ],
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
  const sections = lang === 'fr' ? (hub.sectionsFr || '') : (hub.sectionsEn || '');
  const faq = (lang === 'fr' ? hub.faqFr : hub.faqEn) || [];
  const faqTitle = lang === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions';
  const faqHtml = faq.length ? `<h2>${faqTitle}</h2>\n` + faq.map(f => `<h3>${f.q}</h3>\n<p>${f.a}</p>`).join('\n') : '';
  const faqLd = faq.length ? `<script type="application/ld+json">\n${JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}, null, 2)}\n</script>` : '';
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
${faqLd}
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
  <div class="seotext">
${sections}
${faqHtml}
  </div>
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
