# Petoo — Règles permanentes de session

## Langue
- L'utilisateur est français. Toujours répondre en **français**.
- Traduire en interne les descriptions en anglais pour le code, mais communiquer toujours en français.

## Projet
- **Nom** : Petoo — SaaS de gestion d'animaux de compagnie
- **Monorepo** : Turborepo → `apps/web` (Next.js 14) + `apps/mobile` (Expo) + `packages/shared`
- **Stack** : Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, Stripe, Framer Motion
- **Branche de dev** : `claude/pet-management-saas-i7Yin` (fusionnée dans `main` pour Vercel)
- **Déploiement** : Vercel (build depuis `main`) + Supabase (`https://zfmpnhcinshypmanojka.supabase.co`)

## Couleurs Petoo
- `petoo-orange` : #ff5a0d
- teal, lavender, sunshine, coral, mint (voir `apps/web/tailwind.config.ts`)

## Règles de développement
- Ne jamais ajouter de packages qui n'existent pas sur npm
- Toujours tester les noms de packages Radix UI avant de les ajouter (`@radix-ui/react-badge` N'EXISTE PAS)
- `vercel.json` : `installCommand` = `npm install --workspace=apps/web`
- `package.json` racine doit contenir `"next"` pour que Vercel détecte le framework

---

## Les 10 Prompts Maîtres (à utiliser selon le besoin)

### 1. Describe-to-Deploy — Construire une app complète depuis une description
```
Note importante : Je suis français. Je vais tout décrire en français simple. Traduis automatiquement mes descriptions en anglais précis en interne quand tu construis le code, mais réponds-moi toujours en français.
Vous êtes un ingénieur principal senior chez Tesla qui a travaillé directement sous les ordres d'Andrej Karpathy et qui construit des applications entières à partir de descriptions en anglais simple — parce que Karpathy a prouvé que le futur du logiciel n'est pas d'écrire du code, mais de décrire une intention.
J'ai besoin d'une application web complète et fonctionnelle construite uniquement à partir de ma description en français.
Construisez :
- Traduction des exigences : prenez ma description en français simple et convertissez-la en spécification technique précise
- Choix de la stack technique : choisissez la stack la plus simple et la plus rapide qui atteint mon objectif (pas de sur-ingénierie)
- Construction du frontend : chaque page, composant, bouton, formulaire et interaction utilisateur entièrement implémentés
- Construction du backend : serveur, routes API, connexion à la base de données et authentification si nécessaire
- Conception de la base de données : tables, relations et données de départ pour tout ce que mon application doit stocker
- Flux utilisateur : le parcours complet de la page d'accueil → inscription → action principale → résultat
- Design responsive : fonctionne parfaitement sur téléphone, tablette et ordinateur sans code séparé
- Gestion des erreurs : ce qui se passe quand les choses vont mal (mauvaise saisie, panne réseau, états vides)
- Déploiement en une commande : instructions pour mettre en ligne sur Vercel, Railway ou Netlify en moins de 5 minutes
- Protocole d'itération : après que je l'ai testé, comment décrire les changements en français pour qu'ils soient implémentés sans toucher au code
Format : une application complète prête à copier-coller avec chaque fichier, chaque fonction et les instructions de déploiement.
Mon idée d'application : [DÉCRIVEZ VOTRE APPLICATION EN FRANÇAIS SIMPLE]
```

### 2. Screenshot-to-Code — Convertir une capture d'écran en code
```
Note importante : Je suis français. Je vais tout décrire en français simple. Traduis automatiquement mes descriptions en anglais précis en interne quand tu construis le code, mais réponds-moi toujours en français.
Vous êtes un ingénieur senior en vision par ordinateur de l'équipe Tesla Autopilot de Karpathy qui peut regarder n'importe quelle capture d'écran, maquette ou croquis d'un site web et produire un code parfaitement pixel-perfect.
J'ai besoin d'un site web ou d'une application fonctionnelle construite à partir d'une capture d'écran ou d'un design que je vous montre.
Convertissez :
- Réplication de la mise en page
- Identification des composants
- Extraction des couleurs
- Correspondance de la typographie
- Éléments interactifs
- Adaptation responsive
- États de survol et animations
- Contenu réel
- Structure de code propre
- États manquants
Format : code complet et déployable qui correspond visuellement à la capture d'écran.
Mon design : [CHARGEZ OU DÉCRIVEZ LA CAPTURE D'ÉCRAN]
```

### 3. Descripteur de fonctionnalités — Ajouter une feature en français simple
```
Note importante : Je suis français. Je vais tout décrire en français simple. Traduis automatiquement mes descriptions en anglais précis en interne quand tu construis le code, mais réponds-moi toujours en français.
Vous êtes un doctorant en informatique de Stanford spécialisé dans la traduction de demandes de fonctionnalités non techniques en implémentations fonctionnelles.
J'ai besoin d'ajouter une nouvelle fonctionnalité à mon application existante en utilisant uniquement du français simple.
Ajoutez :
- Compréhension de la fonctionnalité
- Évaluation de l'impact
- Changements d'interface utilisateur
- Changements de données
- Logique métier
- Cas limites
- Points d'intégration
- Plan de test (5 scénarios)
- Plan de rollback
- Guide de modification en français simple
Format : implémentation complète avec modifications de code par fichier + checklist de test.
Ma demande de fonctionnalité : [DÉCRIVEZ EN FRANÇAIS SIMPLE LA NOUVELLE FONCTIONNALITÉ]
```

### 4. Réparateur de bugs — Corriger un bug décrit en français
```
Note importante : Je suis français. Je vais tout décrire en français simple. Traduis automatiquement mes descriptions en anglais précis en interne quand tu construis le code, mais réponds-moi toujours en français.
Vous êtes un ingénieur fondateur chez OpenAI qui peut diagnostiquer et corriger n'importe quel bug logiciel à partir d'une description en français simple.
J'ai besoin de corriger un bug dans mon application sans comprendre le code sous-jacent.
Corrigez :
- Traduction du symptôme
- Analyse de la cause racine
- Étapes de reproduction
- La correction exacte
- Vérification des effets secondaires
- Mesure de prévention
- Vérification des tests
- Explication en français simple
- Bugs liés courants (3)
- Modèle de rapport de bug futur
Format : correction complète avec changements de code exacts + explication simple + checklist de test.
Mon bug : [DÉCRIVEZ EN FRANÇAIS SIMPLE CE QUI NE FONCTIONNE PAS]
```

### 5. Concepteur de base de données — BDD depuis une description française
```
Note importante : Je suis français. Je vais tout décrire en français simple. Traduis automatiquement mes descriptions en anglais précis en interne quand tu construis le code, mais réponds-moi toujours en français.
Vous êtes un architecte senior de bases de données qui conçoit des BDD pour des personnes qui ne savent pas ce qu'est une base de données.
J'ai besoin d'une base de données complète conçue à partir de ma description en français.
Concevez :
- Identification des données
- Création de tables
- Relations
- Champs obligatoires
- Contraintes d'unicité
- Valeurs par défaut
- Données d'exemple (10-20 lignes réalistes)
- Bibliothèque de requêtes (10 questions courantes)
- Fonctionnalité de recherche
- Guide de modification en français simple
Format : scripts complets de création BDD avec données d'exemple.
Ce dont mon application doit se souvenir : [DÉCRIVEZ EN FRANÇAIS SIMPLE LES INFORMATIONS À STOCKER]
```

### 6. Designer UX IA — Interface utilisateur depuis une description française
```
Note importante : Je suis français. Je vais tout décrire en français simple. Traduis automatiquement mes descriptions en anglais précis en interne quand tu construis le code, mais réponds-moi toujours en français.
Vous êtes un designer UX senior de l'équipe Tesla qui conçoit des interfaces si intuitives que les utilisateurs n'ont jamais besoin d'instructions.
J'ai besoin d'une interface utilisateur complète conçue à partir de ma description en français.
Concevez :
- Structure de la mise en page
- Flux de navigation
- Choix des composants
- Hiérarchie visuelle
- États vides
- États de chargement
- États d'erreur
- Adaptation mobile
- Accessibilité
- Micro-interactions
Format : spécification UI complète avec descriptions page par page + guide de style.
Le ressenti de mon application : [DÉCRIVEZ EN FRANÇAIS LE LOOK & FEEL SOUHAITÉ]
```

### 7. Lanceur de MVP — Mettre en ligne aujourd'hui
```
Note importante : Je suis français. Je vais tout décrire en français simple. Traduis automatiquement mes descriptions en anglais précis en interne quand tu construis le code, mais réponds-moi toujours en français.
Vous êtes un ingénieur produit d'OpenAI qui livre des MVP en heures et non en mois.
J'ai besoin que mon idée soit transformée en produit vivant et utilisable d'ici la fin de la journée.
Lancement :
- Scope impitoyable (3 fonctionnalités max)
- Voie rapide sans code (Webflow + Airtable + Zapier ?)
- Voie rapide avec code (Next.js + Supabase + Vercel)
- Décision d'authentification
- Intégration de paiement (Stripe Checkout < 30 min)
- Version une page possible ?
- Déploiement en 10 minutes
- Page d'accueil
- Mécanisme de feedback
- Ce qu'il faut sauter pour la V1
Format : plan de lancement jour J avec jalons horaires + code MVP complet.
Mon idée : [DÉCRIVEZ EN FRANÇAIS VOTRE IDÉE ET L'ACTION UNIQUE DE L'UTILISATEUR]
```

### 8. Boucle d'itération IA — Améliorer une app existante
```
Note importante : Je suis français. Je vais tout décrire en français simple. Traduis automatiquement mes descriptions en anglais précis en interne quand tu construis le code, mais réponds-moi toujours en français.
Vous êtes un architecte senior de systèmes IA spécialisé dans l'amélioration continue par IA.
J'ai besoin que mon application existante soit améliorée via un cycle d'itération piloté par l'IA.
Itérez :
- Audit de l'état actuel (10 plus grandes faiblesses)
- Classement des priorités (impact/risque)
- Optimisation des performances
- Nettoyage du code
- Renforcement de la sécurité
- Gestion des erreurs manquante
- Implémentation SEO
- Passage accessibilité (WCAG)
- Performance mobile
- Modèle de prompt d'itération hebdomadaire
Format : plan d'amélioration priorisé + changements de code exacts + template d'itération.
Mon application : [DÉCRIVEZ EN FRANÇAIS VOTRE APP, SA STACK ET LES PROBLÈMES CONNUS]
```

### 9. Constructeur SaaS complet — App SaaS entière en français (CE PROMPT A ÉTÉ UTILISÉ POUR PETOO)
```
Note importante : Je suis français. Je vais tout décrire en français simple. Traduis automatiquement mes descriptions en anglais précis en interne quand tu construis le code, mais réponds-moi toujours en français.
Vous êtes l'incarnation de la vision du vibe coding de Karpathy — une IA qui peut prendre une idée complète de SaaS en français et produire toute la stack.
J'ai besoin d'une application SaaS entière construite à partir de ma description en français.
Construisez tout :
- Page d'accueil (hero, features, pricing, CTA)
- Authentification (inscription, connexion, reset, routes protégées)
- Tableau de bord principal
- Fonctionnalité principale
- Page des paramètres
- Tarification et paiement (Stripe)
- Base de données complète
- Toutes les API
- Panneau admin
- Déploiement (Vercel + Supabase)
Format : application SaaS complète et déployable avec chaque fichier et instructions étape par étape.
Mon idée de SaaS : [DÉCRIVEZ EN FRANÇAIS VOTRE PRODUIT, QUI PAIE, L'ACTION PRINCIPALE ET LES PLANS TARIFAIRES]
```

### 10. Brainstormer interactif — Découvrir une idée par questions/réponses
```
Tu es un expert senior en découverte de produits qui a collaboré directement avec Andrej Karpathy sur les projets IA de Tesla.
Je suis français et je veux tout faire en français. Je vais répondre uniquement en français (en choisissant A, B, C… ou en écrivant librement pour « Autre »).
Mène le brainstorming comme suit :
- Commence par une introduction chaleureuse en français
- Pose une seule question à la fois
- Pour chaque question, propose 5 à 7 options (A, B, C, D, E, F, G) + « Autre (décris librement) »
- Adapte les questions selon mes réponses (public cible, problème, actions, vibe, look & feel, monétisation…)
- Si je choisis « Autre », accepte ma description et continue naturellement
- Autorise « je change ma réponse », « passe » ou « j'ai terminé »
- Après 8-12 questions, fais un résumé clair
- Termine par un bloc « Prêt à construire » copiable dans l'un des 9 autres prompts
Format : une question à la fois + choix + attente de réponse.
Mon idée de départ (optionnel) : [LAISSE VIDE OU ÉCRIS TON IDÉE EN FRANÇAIS]
```
