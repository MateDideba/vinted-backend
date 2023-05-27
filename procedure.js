// Pour pouvoir envoyer notre serveur sur NorthFlank (et qu'il le fasse tourner, on va d'abord envoyer le code source sur GitHub)

// Ainsi, la source de NorthFlank, sera GitHub

// PROBLEME

// Le code sera public, et nous avons des données que nous voulons garder secrètes

// AVANT DENVOYER NOTRE CODE SUR GITHUB, il va falloir planquer les données sensibles : grâce au package dotenv

//  - installer dotenv
//  - créer le fichier .env
//  - définir les variable d'environnement dedans
//  - lister dans le fichier .gitignore tous les fichiers à ignorer lors de l'envoi à GitHub : .env / node_modules / package-lock.json

// - SEULEMENT ENSUITE, envoyer le code sur GitHub, mais pour cela, il faut créer un repository (répertoire)
// - suivre les instructions, en remplacant `git add README.md` par `git add .`
