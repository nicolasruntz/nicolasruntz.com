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
- Composants `.astro` uniquement ; le seul JavaScript client est le script
  minimal du champ mot de passe (`PasswordGate.astro`)

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
`src/pages/ap-automation-software/index.astro` lit son contenu depuis cette
collection (`getEntry` + `render`) plutôt que de l'écrire en dur — pour
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

Contenu de remplacement ("AP Automation Software"). Cette page porte une
balise `<meta name="robots" content="noindex, nofollow">` et est exclue du
sitemap (filtre dans `astro.config.mjs`) ainsi que du `robots.txt`.

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
