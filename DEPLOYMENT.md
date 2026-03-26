# 🐾 Petoo — Guide de Déploiement Complet

> Guide étape par étape pour déployer Petoo en production.
> **Temps estimé : 45-90 minutes**

---

## 📋 Prérequis

- Compte GitHub (gratuit)
- Compte Vercel (gratuit) → vercel.com
- Compte Supabase (gratuit) → supabase.com
- Compte Stripe (gratuit) → stripe.com
- Node.js 18+ installé localement

---

## ÉTAPE 1 — Supabase (Base de données + Auth)

### 1.1 Créer un projet Supabase

1. Allez sur **https://supabase.com** → "New Project"
2. Choisissez votre organisation
3. Nommez le projet : `petoo`
4. Choisissez un mot de passe fort pour la base de données (sauvegardez-le !)
5. Région : **eu-west-1** (Europe - Irlande) pour les utilisateurs français
6. Cliquez "Create new project" — attendez ~2 minutes

### 1.2 Récupérer les clés API

1. Allez dans **Project Settings → API**
2. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Exécuter les migrations SQL

1. Allez dans **SQL Editor** (icône dans la barre latérale)
2. Cliquez "New query"
3. Copiez-collez le contenu de `/supabase/migrations/001_initial_schema.sql`
4. Cliquez "Run" (▶)
5. Vous devriez voir "Success. No rows returned"

### 1.4 Configurer l'authentification

1. **Authentication → Settings**
2. **Email** : Activez "Confirm email"
3. **Site URL** : `https://votre-app.vercel.app`
4. **Redirect URLs** : Ajoutez `https://votre-app.vercel.app/auth/callback`
5. (Optionnel) Configurez un fournisseur email custom avec Resend ou SendGrid

### 1.5 Configurer le Storage

Le script SQL crée automatiquement les buckets. Vérifiez dans **Storage** :
- `avatars` (public)
- `pet-photos` (public)
- `portfolio` (public)
- `session-files` (privé)
- `documents` (privé)

---

## ÉTAPE 2 — Stripe (Paiements)

### 2.1 Créer un compte Stripe

1. Allez sur **https://stripe.com** → Créer un compte
2. Complétez votre profil (pour la production)
3. Restez en **mode Test** pour commencer

### 2.2 Créer les produits et prix

Dans **Products** → "Add product" :

**Produit 1 : Petoo Premium**
- Nom : "Petoo Premium"
- Pricing :
  - Mensuel : 4.99€/mois → copiez le **Price ID** → `STRIPE_PRICE_PREMIUM_MONTHLY`
  - Annuel : 49.99€/an → copiez le **Price ID** → `STRIPE_PRICE_PREMIUM_YEARLY`

**Produit 2 : Petoo Pro**
- Nom : "Petoo Pro"
- Pricing :
  - Mensuel : 29.99€/mois → copiez le **Price ID** → `STRIPE_PRICE_PRO_MONTHLY`
  - Annuel : 299.99€/an → copiez le **Price ID** → `STRIPE_PRICE_PRO_YEARLY`

### 2.3 Récupérer les clés Stripe

Dans **Developers → API keys** :
- **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Secret key** → `STRIPE_SECRET_KEY`

### 2.4 Configurer le webhook Stripe

1. **Developers → Webhooks** → "Add endpoint"
2. URL : `https://votre-app.vercel.app/api/stripe/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copiez le **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## ÉTAPE 3 — Vercel (Déploiement Web)

### 3.1 Préparer le dépôt GitHub

```bash
# Depuis la racine du projet
git add .
git commit -m "Initial Petoo setup"
git push origin main
```

### 3.2 Importer sur Vercel

1. Allez sur **https://vercel.com** → "Add New Project"
2. Importez votre dépôt GitHub
3. **Root Directory** : `apps/web`
4. **Framework Preset** : Next.js (détecté automatiquement)

### 3.3 Configurer les variables d'environnement

Dans Vercel, onglet **Environment Variables**, ajoutez toutes ces variables :

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# App
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
NEXT_PUBLIC_APP_NAME=Petoo
```

### 3.4 Déployer

Cliquez **"Deploy"** — Vercel build et déploie automatiquement.

Résultat : votre app est accessible sur `https://petoo-xxx.vercel.app`

### 3.5 Domaine personnalisé (optionnel)

1. Achetez `petoo.fr` ou `petoo.app` sur OVH, Gandi, etc.
2. Dans Vercel → **Settings → Domains** → ajoutez votre domaine
3. Suivez les instructions DNS

---

## ÉTAPE 4 — App Mobile (Expo / EAS)

### 4.1 Installer les outils

```bash
npm install -g expo-cli eas-cli
eas login  # Créez un compte sur expo.dev
```

### 4.2 Configurer l'app

```bash
cd apps/mobile
cp .env.example .env
# Remplissez les variables avec vos clés Supabase
```

Éditez `app.json` :
- Remplacez `"your-eas-project-id"` par votre vrai ID EAS

### 4.3 Configurer EAS Build

```bash
eas build:configure
```

### 4.4 Build iOS (TestFlight)

```bash
eas build --platform ios --profile preview
```

Soumission App Store :
```bash
eas submit --platform ios
```

### 4.5 Build Android (Play Store)

```bash
eas build --platform android --profile preview
eas submit --platform android
```

---

## ÉTAPE 5 — Vérification post-déploiement

### Checklist

- [ ] La page d'accueil s'affiche correctement
- [ ] L'inscription par email fonctionne
- [ ] L'email de confirmation arrive
- [ ] La connexion fonctionne
- [ ] Le tableau de bord est accessible
- [ ] On peut ajouter un animal
- [ ] Le calendrier s'affiche
- [ ] La page toilettage s'affiche
- [ ] Les tarifs s'affichent avec les vrais prix Stripe
- [ ] Un paiement test Stripe fonctionne (carte `4242 4242 4242 4242`)
- [ ] Le webhook Stripe met à jour l'abonnement
- [ ] L'admin panel est accessible (créer un admin manuellement dans Supabase)

### Créer le premier compte admin

Dans **Supabase → SQL Editor** :
```sql
UPDATE profiles SET is_admin = true WHERE email = 'votre@email.com';
```

---

## ÉTAPE 6 — Mise en production Stripe

Quand vous êtes prêt à accepter de vrais paiements :

1. **Stripe Dashboard** → activez le mode Live
2. Recréez les produits/prix en mode Live
3. Mettez à jour les variables d'environnement Vercel avec les clés **live** (pas test)
4. Recréez le webhook avec l'URL de production

---

## 🌍 Internationalisation & RGPD

### Cookies & RGPD (France/EU)
- Ajoutez un bandeau de cookies (ex: `react-cookie-consent`)
- Rédigez une politique de confidentialité (obligatoire pour l'EU)
- Hébergez les données en Europe (Supabase eu-west-1 ✅)
- Supabase est conforme RGPD

### Mentions légales
Éditez `apps/web/src/components/landing/footer.tsx` pour ajouter vos vraies mentions légales.

---

## 🔧 Maintenance & Updates

### Déployer une mise à jour

```bash
git add .
git commit -m "feat: votre description"
git push origin main
# Vercel redéploie automatiquement en ~2 minutes
```

### Voir les logs

- **Vercel** → Functions → Logs
- **Supabase** → Logs Explorer

### Backup base de données

- Supabase fait des backups automatiques quotidiens (plan Pro)
- Pour les plans gratuits : exportez manuellement via `pg_dump`

---

## 💰 Coûts mensuels estimés (phase initiale)

| Service | Plan | Coût |
|---------|------|------|
| Vercel | Hobby (gratuit) | 0€ |
| Supabase | Free (gratuit) | 0€ |
| Stripe | % sur transactions | 1,4% + 0,25€ par paiement |
| Domaine | .app ou .fr | ~15€/an |
| **Total démarrage** | | **~0-15€/mois** |

Plan gratuit Supabase : 500MB base de données, 1GB storage, 50k utilisateurs actifs/mois.
Vercel Hobby : deployments illimités, 100GB bandwidth/mois.

---

## 🆘 Problèmes courants

### "Invalid Supabase URL"
→ Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` commence bien par `https://` et finit par `.supabase.co`

### "Stripe webhook signature invalid"
→ Le secret du webhook en développement est différent de la production. Utilisez `stripe listen` en local.

### "User already registered"
→ L'utilisateur existe déjà. Utilisez "mot de passe oublié" ou supprimez l'utilisateur dans Supabase Auth.

### Build Vercel échoue
→ Vérifiez les logs. Souvent une variable d'environnement manquante.

---

*Petoo — Fait avec ❤️ en France 🇫🇷*
