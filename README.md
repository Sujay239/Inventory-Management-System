# Inventory Management System

An **Nx monorepo** with a React + Vite + TypeScript frontend and a Node.js/Express backend, styled with **Tailwind CSS** and **shadcn/ui**.

## 📁 Structure

```
inventory-management/         ← Nx Workspace Root
├── nx.json
├── package.json
├── tsconfig.base.json
└── packages/
    ├── frontend/             ← React + Vite + TS + Tailwind + shadcn/ui
    │   ├── src/
    │   │   ├── components/ui/   ← shadcn/ui components
    │   │   ├── lib/utils.ts
    │   │   ├── App.tsx
    │   │   └── main.tsx
    │   ├── components.json      ← shadcn/ui config
    │   └── vite.config.ts
    └── backend/              ← Node.js + Express + TypeScript
        └── src/main.ts
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the frontend

```bash
npx nx serve frontend
# or
npm run frontend
```

Opens at **http://localhost:4200**

### 3. Run the backend

```bash
npx nx serve backend
# or
npm run backend
```

API available at **http://localhost:3000**

## 🎨 Adding shadcn/ui Components

From the `packages/frontend` directory:

```bash
cd packages/frontend
npx shadcn@latest add <component-name>

# Examples:
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add table
```

## 🛠️ Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Build    | Nx 20, npm workspaces            |
| Frontend | React 18, Vite 6, TypeScript 5.7 |
| Styling  | Tailwind CSS 3, shadcn/ui        |
| Backend  | Node.js, Express 4, TypeScript   |
