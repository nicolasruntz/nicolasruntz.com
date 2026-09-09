# nicolasruntz.com

Site personnel construit avec [Astro](https://astro.build) en sortie
statique (`output: 'static'`), sans adaptateur d'hébergement : le résultat
du build (`dist/`) est un dossier de fichiers statiques destiné à être
déployé sur Cloudflare (Pages/Workers).

## Stack

- **Astro** + **TypeScript** (mode `strict`)
- **Tailwind CSS v4** (plugin Vite `@tailwindcss/vite`, pas de fichier de
  config Tailwind nécessaire)
- **Astro Content Collections** pour le contenu Markdown/MDX
- **@astrojs/mdx** pour écrire du contenu en MDX
- **@astrojs/sitemap** pour générer `sitemap-index.xml`
- **@astrojs/preact** pour la seule partie interactive du site : la landing
  page `/ap-automation-software/`, dont la personnalisation à l'exécution
  demande un vrai état client. Partout ailleurs, composants `.astro`
  uniquement (le champ mot de passe garde son script minimal).

## Structure du projet

```
src/
  content.config.ts          # déclaration des collections de contenu
  content/
    pages/                   # contenu Markdown/MDX (une collection "pages")
      ap-automation-software.mdx
  layouts/
    BaseLayout.astro          # <head> partagé : meta, title, description,
                               # canonical, Open Graph, balise robots
  components/
    PasswordGate.astro        # champ mot de passe + vérification client
    YouTubeEmbed.astro        # iframe YouTube responsive, chargement différé
    ap/                       # la landing page AP automation (Preact)
      ApLanding.tsx             # racine de l'îlot : état + composition
      data.ts                   # tables industries / ERP, strips, cas clients
      personalisation.ts        # dérive toutes les surfaces personnalisées
      hooks.ts                  # pause des animations, parallaxe, section lue
      Header.tsx  Hero.tsx  DemoForm.tsx  Features.tsx
      FeatureVisuals.tsx  Sections.tsx  SidePanel.tsx
      DemoModal.tsx  Icon.tsx
  styles/
    global.css                # entrée Tailwind
    yooz.css                  # tokens du design system Yooz
    ap-automation.css         # mise en page + 36 keyframes de la landing
  pages/
    index.astro                # page d'accueil "/"
    ap-automation-software/
      index.astro               # page "/ap-automation-software/"
public/
  robots.txt
  favicon.svg
```

### Content Collections

Le site n'a pour l'instant que deux pages, mais la structure de contenu est
en place pour grandir : la collection `pages` (définie dans
`src/content.config.ts`) charge tous les fichiers `.md`/`.mdx` du dossier
`src/content/pages/` via le `glob` loader d'Astro. Chaque entrée a un
schéma Zod (`title`, `description`, `noindex`). La route
`src/pages/ap-automation-software/index.astro` lit ses métadonnées depuis
cette collection (`getEntry`) plutôt que de les écrire en dur — pour
ajouter une nouvelle page de contenu, il suffit d'ajouter un fichier
`.md`/`.mdx` dans `src/content/pages/` et une route qui le rend.

### Page d'accueil ("/")

Une seule phrase — « Do not go gentle into that good night » — au-dessus d'un
champ de passphrase, sur un **ruban animé en WebGL**.

**Le ruban** (`src/components/home/RibbonBackground.tsx`) est une longue
diagonale montante à deux inflexions — le trait médian du Z de Yooz, détendu
en une courbe continue — superposée sur deux ou trois couches pour qu'elle se
lise comme une matière translucide et non comme un aplat. Le Rich Blue porte
la forme ; le Pink la traverse comme une énergie plutôt que de s'y poser en
masse. Un vertex shader déforme lentement le plan du ruban ; le fragment
shader dessine les dégradés, les lignes directionnelles internes et la
texture. **Toutes les couleurs sont lues à l'exécution sur les tokens de
`yooz.css`** : la palette a une seule source de vérité et ne peut pas dériver.

Performance et accessibilité :

- `client:idle` — la phrase et le champ s'affichent et fonctionnent avant que
  le canvas ne charge ; aucun décalage de mise en page (CLS mesuré à 0).
- Device pixel ratio plafonné à 1,5 ; 30 images/s sur les machines à faible
  nombre de cœurs, qui reçoivent aussi moins de couches.
- Le rendu s'arrête quand l'onglet est masqué et quand le canvas sort du
  viewport ; l'horloge repart sans à-coup.
- `prefers-reduced-motion` : une seule image, même composition, aucune boucle.
- Sans WebGL, `public/home/ribbon-fallback.webp` (19 Ko, chargé uniquement
  dans ce cas) prend le relais au-dessus d'un dégradé CSS peint d'emblée.
- Canvas `aria-hidden` et `pointer-events: none` ; le texte reste du HTML.
- Cadrage propre au mobile — le ruban remonte au-dessus de la zone de texte
  plutôt que d'être une réduction du desktop.

**Le ruban ne passe jamais sur le texte.** La page est une grille à deux
zones : le ruban occupe la bande supérieure (40 svh) et se dissout dans le
blanc-gris par un `mask-image` avant que la zone de contenu ne commence ;
la phrase et le champ sont centrés dans la zone du dessous. Il n'y a donc
plus de voile blanc à doser — contraste mesuré du texte sur le fond :
11,4:1 à toutes les largeurs, soit celui du Rich Blue sur le blanc-gris nu.
Le dégradé CSS d'amorçage disparaît dès la première image WebGL (le canvas
arrive en fondu) : partageant le masque avec le canvas, il transparaissait
dans la zone de fondu comme une tache grise.

**Le champ de passphrase** (`PasswordGate.astro`) est une pilule givrée avec
icône, placeholder statique, label hors écran pour les lecteurs d'écran, et
bouton circulaire. Pas de label flottant : dans une pilule avec icône en tête,
il laissait l'icône échouée entre le label remonté et le texte saisi. La vérification est **uniquement côté client** : ce n'est
pas un mécanisme de sécurité, juste un aiguillage. La valeur attendue est
`lazarus` (insensible à la casse et aux espaces) et redirige vers
`/ap-automation-software/`. **En cas d'erreur, rien ne s'affiche** : pas de
message, pas de changement de couleur, pas de secousse — le champ se vide et
attend. La page porte aussi un JSON-LD de type `Person`.

### Page "/ap-automation-software/"

Landing page de conversion pour le marché nord-américain (US + Canada,
anglais), pensée pour du trafic Google Ads. Un seul objectif : la demande de
démo. Sa particularité est la **personnalisation à l'exécution** — le
visiteur choisit une industrie et/ou un ERP/DMS dans les deux sélecteurs du
header, et une quinzaine de surfaces se réécrivent : le H1, le chapeau et le
sous-titre du hero, la bande de wordmarks ERP (remplacée par une citation
client dès qu'un système est choisi), une carte feature entière, deux
questions et deux réponses de la FAQ, le titre des cas clients, le panneau
latéral contextuel et le formulaire de démo.

Rien n'est derrière un login, rien n'est appelé en réseau : toute la
personnalisation vient de deux tables livrées avec la page
(`src/components/ap/data.ts`), et `personalise()` en dérive chaque surface.

- **Un seul îlot Preact** (`ApLanding.tsx`, `client:load`). La sélection
  touche le header, le hero, les features, la FAQ et le panneau à la fois :
  découper en plusieurs îlots reviendrait à partager le même état entre eux
  sans rien y gagner. Astro pré-rend l'îlot en HTML statique complet ;
  l'hydratation n'ajoute que l'interaction.
- Les tokens vivent dans `src/styles/yooz.css` ; la mise en page et les 36
  `@keyframes` dans `src/styles/ap-automation.css`. Les deux ne sont importés
  que par cette route ; le reste du site garde Tailwind.
- **Les animations hors écran sont mises en pause.** Chaque bloc animé porte
  `data-yz-anim` ; un `IntersectionObserver` unique (marge 160px) pose
  `data-yz-paused`, que la feuille de style traduit en
  `animation-play-state: paused`. Sept conteneurs portent 31 animations
  infinies — sans ce mécanisme elles repeignent en continu, ce qui coûte cher
  en INP sur mobile milieu de gamme, sur une page payée au clic.
- Le panneau latéral est `position: fixed`, jamais dans le flux, et suit la
  section lue pour adapter son message et son CTA. Sous 1030px il se réduit à
  un lanceur épinglé en bas à droite.
- La parallaxe du hero est coupée sur pointeur grossier, sous 1024px et en
  `prefers-reduced-motion`.
- Une campagne peut pré-filtrer la page par URL :
  `?industry=auto&erp=intacct`. Les valeurs sont validées contre les tables,
  donc un paramètre erroné retombe sur la page non personnalisée.
- Noto Sans (300/400/600) et Material Symbols Outlined sont chargés depuis
  Google Fonts, comme le prescrit le design system.

Cette page porte une balise `<meta name="robots" content="noindex, nofollow">`
et est exclue du sitemap (filtre dans `astro.config.mjs`) ainsi que du
`robots.txt`.

#### Reste à faire avant du trafic payant

Le formulaire ne poste nulle part : la temporisation entre les étapes tient
lieu d'aller-retour réseau. Manquent aussi l'attribution Ads (champs cachés
UTM / gclid, `dataLayer`), le lien politique de confidentialité et la case de
consentement, et les images officielles des badges G2 / Capterra — les badges
actuels sont typographiques et leurs millésimes sont à vérifier. Les deux
photos des cas clients sont des images de stock étalonnées à la charte,
placées au-dessus du nom d'une personne réelle : la licence et cette
juxtaposition sont à valider avant mise en ligne.

## Commandes

| Commande          | Action                                              |
| :---------------- | :--------------------------------------------------- |
| `npm install`     | Installe les dépendances                             |
| `npm run dev`      | Lance le serveur de dev local                        |
| `npm run build`    | Vérifie les types (`astro check`) puis build statique dans `dist/` |
| `npm run preview`  | Prévisualise le build statique                       |

## Déploiement

Aucun adaptateur d'hébergement n'est configuré : `npm run build` produit un
dossier `dist/` de fichiers statiques, prêt à être déployé tel quel sur
Cloudflare Pages (ou tout autre hébergeur de fichiers statiques).
