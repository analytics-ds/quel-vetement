# Preprod - Page d'accueil Quel Vêtement

Site statique deployable de la page d'accueil de **quel-vetement.com** (preprod).

Construit à partir d'une capture fidèle de la home d'apetogentleman.com, intégralement :
- **rebrandée** en Quel Vêtement (domaine, thème, logo) ;
- **traduite en français** (menus, titres, extraits, newsletter, footer) ;
- **nettoyée** de tout tracking / pub / consentement (0 requête externe au chargement) ;
- **autonome** : polices, CSS, JS et images servis en local (Adobe Fonts inclus).

## Déploiement

Les chemins d'assets sont en **racine** (`/wp-content/...`, `/__ext/...`). Uploader le
contenu de ce dossier à la **racine** du serveur preprod pour que le site se serve directement.
Servi depuis un sous-chemin (ex. GitHub Pages `/preprod-home/`), les chemins absolus ne
résolvent pas : utiliser la racine d'un domaine/sous-domaine dédié.

Aperçu en ligne : https://quel-vetement-home.pages.dev/
