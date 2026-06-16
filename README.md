# Quel Vêtement - Site (preprod page d'accueil)

Site statique de la page d'accueil de **quel-vetement.com**.

Construit à partir d'une capture fidèle d'une home de référence, intégralement :
- **rebrandée** Quel Vêtement (domaine, thème, logo) ;
- **traduite en français** (menus, titres, extraits, newsletter, footer, citation) ;
- **nettoyée** de tout tracking / pub / consentement (0 requête externe au chargement) ;
- **autonome** : polices (Adobe Fonts incluses), CSS, JS et images servis en local.

## Déploiement

Les chemins d'assets sont en **racine** (`/wp-content/...`, `/__ext/...`). Servir le contenu
de ce repo à la **racine d'un domaine** (ou via un domaine personnalisé). Servi depuis un
sous-chemin (ex. `user.github.io/quel-vetement/`), les chemins absolus ne résolvent pas.

Aperçu en ligne : https://quel-vetement-home.pages.dev/

## Historique

L'ancien site Hugo (guides / comparatifs mode homme) est conservé sur la branche
[`hugo-archive`](../../tree/hugo-archive).
