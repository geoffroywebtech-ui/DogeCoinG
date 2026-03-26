# 🐾 Petoo — L'app tout-en-un pour les animaux de compagnie

> SaaS complet pour propriétaires de chiens 🐕, chats 🐈 et lapins 🐇

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![React Native](https://img.shields.io/badge/React_Native-Expo-blue)](https://expo.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-purple)](https://stripe.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)

---

## 🌟 Noms suggérés pour l'app

| Nom | Concept |
|-----|---------|
| **Petoo** ⭐ | Court, ludique, sonne comme "pitou" (argot FR pour chien), universel EN/FR |
| **PawNest** | "Nid de pattes" — chaleureux, bilingue naturel |
| **FurFamille** | "Fur" (EN) + "Famille" (FR) — hybride bilingue créatif |

---

## 🚀 Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Web** | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| **Mobile** | React Native + Expo (iOS + Android) |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Paiements** | Stripe (abonnements + marketplace) |
| **Déploiement** | Vercel (web) + EAS Build (mobile) |
| **Monorepo** | Turborepo |

---

## 📁 Structure du Projet

```
petoo/
├── apps/
│   ├── web/                    # Next.js 14 Web App
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/     # Login, Register, Forgot Password
│   │   │   │   ├── (dashboard)/# Dashboard, Pets, Calendar, Grooming...
│   │   │   │   ├── (admin)/    # Panneau admin
│   │   │   │   └── api/        # API Routes
│   │   │   ├── components/     # Composants UI réutilisables
│   │   │   ├── lib/            # Supabase, Stripe, utils
│   │   │   └── types/          # Types TypeScript
│   │   └── ...
│   └── mobile/                 # React Native + Expo
│       ├── app/
│       │   ├── (auth)/         # Auth screens
│       │   └── (tabs)/         # Tab navigation screens
│       └── ...
├── packages/
│   └── shared/                 # Types et utils partagés
├── supabase/
│   └── migrations/             # Scripts SQL
├── DEPLOYMENT.md               # Guide de déploiement complet
└── README.md
```

---

## 🎯 Fonctionnalités

| Fonctionnalité | Web | Mobile |
|----------------|-----|--------|
| Page d'accueil (hero, features, pricing, testimonials) | ✅ | — |
| Inscription / Connexion / Mot de passe oublié | ✅ | ✅ |
| Tableau de bord utilisateur | ✅ | ✅ |
| Gestion des animaux (dog/cat/rabbit) | ✅ | ✅ |
| Calendrier santé + rappels intelligents | ✅ | ✅ |
| Module toilettage (recherche géolocalisée, réservation) | ✅ | ✅ |
| Services (vétérinaire, garde, promenade) | ✅ | ✅ |
| Urgence vétérinaire 1 tap | — | ✅ |
| Programme fidélité (points + récompenses) | ✅ | ✅ |
| Abonnement Stripe (Free/Premium/Pro) | ✅ | — |
| Panneau admin | ✅ | — |
| Paramètres (profil, abonnement, notifications) | ✅ | — |

---

## 💳 Modèle de Monétisation

| Source | Taux |
|--------|------|
| Commission sur réservations | 12% |
| Abonnement Premium (propriétaires) | 4.99€/mois |
| Abonnement Pro (professionnels) | 29.99€/mois |
| Annonces en vedette | Prix fixe/mois |

---

## 🛠️ Démarrage Local

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cd apps/web && cp .env.example .env.local
# Remplir avec vos clés Supabase + Stripe

# 3. Lancer en développement
cd ../.. && npm run dev

# 4. App Mobile
cd apps/mobile && npx expo start
```

---

## 📦 Déploiement

Voir **[DEPLOYMENT.md](./DEPLOYMENT.md)** pour le guide complet.

1. Supabase → créer projet + exécuter migration SQL
2. Stripe → créer produits et prix
3. Vercel → importer repo + variables d'env → Deploy
4. Mobile → `eas build` pour iOS/Android

---

*Petoo — Fait avec ❤️ en France 🇫🇷*
