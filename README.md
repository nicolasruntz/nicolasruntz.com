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

Un champ mot de passe centré avec bouton de validation. La vérification est
**uniquement côté client** (dans `PasswordGate.astro`) : ce n'est pas un
mécanisme de sécurité, juste un aiguillage simple. Si la valeur saisie est
`docking`, redirection vers `/ap-automation-software/` ; sinon, un message
d'erreur discret s'affiche sans rechargement de page. Sous le champ, une
vidéo YouTube est intégrée en iframe responsive (`youtube-nocookie.com`,
`loading="lazy"`, attribut `title`). La page porte aussi un JSON-LD de type
`Person` (nom : Nicolas Runtz).

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
