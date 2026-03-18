# 🎂 Birthday Studio — Guide de déploiement complet
## Pour débutants — 0€/mois — Vercel + Supabase

---

## 🗺 VUE D'ENSEMBLE

```
Votre ordinateur
     │
     ▼
 GitHub (code)
     │
     ├──▶ Vercel (site web) ──▶ https://birthday-studio.vercel.app
     │
     └──▶ Supabase (base de données + auth)
```

**Temps estimé : 30-45 minutes**

---

## ÉTAPE 1 — Créer un compte GitHub

1. Allez sur **https://github.com**
2. Cliquez **Sign up** → entrez email + mot de passe + nom d'utilisateur
3. Confirmez votre email

---

## ÉTAPE 2 — Mettre le code sur GitHub

### Option A : Interface web (recommandé pour débutants)

1. Sur GitHub, cliquez le **+** en haut à droite → **New repository**
2. Nom : `birthday-studio`
3. Visibilité : **Public** (gratuit)
4. Cliquez **Create repository**
5. Sur la page suivante, cliquez **uploading an existing file**
6. Glissez-déposez **tous les fichiers** du dossier `birthday-studio/`
   en respectant la structure :
   ```
   index.html
   vercel.json
   src/
     style.css
     supabase.js
     auth.js
     studio.js
     gallery.js
   supabase/
     migrations/
       001_cards.sql
   ```
7. Cliquez **Commit changes**

---

## ÉTAPE 3 — Créer un projet Supabase

1. Allez sur **https://supabase.com**
2. Cliquez **Start your project** → connectez avec GitHub
3. Cliquez **New project**
4. Remplissez :
   - **Name** : `birthday-studio`
   - **Database Password** : choisissez un mot de passe fort (notez-le !)
   - **Region** : choisissez le plus proche (ex: Frankfurt pour l'Europe)
5. Cliquez **Create new project** (attendre ~2 minutes)

### 3b — Créer la table SQL

1. Dans votre projet Supabase, allez dans **SQL Editor** (menu gauche)
2. Cliquez **New query**
3. Copiez-collez le contenu du fichier `supabase/migrations/001_cards.sql`
4. Cliquez **Run** (bouton vert)
5. Vous devez voir : `Success. No rows returned`

### 3c — Récupérer vos clés API

1. Dans Supabase, allez dans **Settings** → **API**
2. Copiez :
   - **Project URL** → ressemble à `https://xxxx.supabase.co`
   - **anon public** key → longue chaîne de caractères

### 3d — Activer l'authentification email

1. Dans Supabase, allez dans **Authentication** → **Providers**
2. **Email** doit être activé (il l'est par défaut ✓)
3. Allez dans **Authentication** → **Email Templates**
4. Personnalisez le mail de confirmation si vous voulez

---

## ÉTAPE 4 — Configurer les clés dans le code

1. Sur GitHub, ouvrez le fichier `src/supabase.js`
2. Cliquez le crayon ✏️ pour éditer
3. Remplacez :
   ```javascript
   const SUPABASE_URL = 'VOTRE_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'VOTRE_SUPABASE_ANON_KEY';
   ```
   par vos vraies valeurs :
   ```javascript
   const SUPABASE_URL = 'https://xxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGc...';
   ```
4. Cliquez **Commit changes**

---

## ÉTAPE 5 — Déployer sur Vercel

1. Allez sur **https://vercel.com**
2. Cliquez **Sign Up** → choisissez **Continue with GitHub**
3. Autorisez Vercel à accéder à GitHub
4. Cliquez **Add New Project** → **Import Git Repository**
5. Sélectionnez votre repo `birthday-studio`
6. Laissez tous les paramètres par défaut
7. Cliquez **Deploy** 🚀

⏳ Attendez 1-2 minutes…

✅ Votre site est en ligne ! Vercel vous donne une URL comme :
```
https://birthday-studio-xxx.vercel.app
```

---

## ÉTAPE 6 — Vérifier que tout fonctionne

Ouvrez votre URL et testez :

- [ ] La page se charge sans erreur
- [ ] Le modal de connexion apparaît
- [ ] "Continuer sans compte" fonctionne (mode invité)
- [ ] Créer un compte avec email fonctionne
- [ ] Uploader une photo et créer une carte fonctionne
- [ ] Le bouton "💾 Sauver" sauvegarde la carte
- [ ] La galerie affiche les cartes sauvegardées
- [ ] L'export fonctionne

---

## 🔄 METTRE À JOUR LE SITE

Chaque fois que vous modifiez un fichier sur GitHub, Vercel redéploie automatiquement en 1-2 minutes.

---

## 🐛 PROBLÈMES COURANTS

### "Failed to fetch" ou erreur de connexion
→ Vérifiez que l'URL et la clé dans `src/supabase.js` sont correctes

### "relation cards does not exist"
→ Vous n'avez pas exécuté le SQL dans Supabase. Refaites l'étape 3b.

### Le modal auth ne disparaît pas après connexion
→ Vérifiez dans Supabase > Authentication que l'email est bien confirmé

### L'export ne fonctionne pas
→ Autorisez les popups dans votre navigateur pour le site

---

## 📊 LIMITES DU PLAN GRATUIT

| Service   | Limite gratuite          |
|-----------|--------------------------|
| Vercel    | Illimité (projets perso) |
| Supabase  | 500 Mo DB, 50 000 users  |
| Photos    | Stockées en base64 (local) |

Pour les photos, la version gratuite stocke les images en base64 directement
dans la base de données. Pour une vraie prod, utilisez Supabase Storage.

---

## 🚀 AMÉLIORATIONS FUTURES (optionnelles)

1. **Domaine personnalisé** : Dans Vercel > Settings > Domains → ajoutez votre domaine
2. **Stocker les photos dans Supabase Storage** : pour éviter de saturer la DB
3. **Partage par lien** : générer une URL unique par carte
4. **Plan Vercel Pro** : 20$/mois pour les équipes

---

*Guide rédigé pour Birthday Studio — Claude AI*
