# Lorekeeper

**The Archive of Imagined Worlds.**

Lorekeeper is a collaborative worldbuilding platform designed to help writers and creators build, organize, and manage fictional universes in one place.

From characters and locations to factions, timelines, and interconnected lore, Lorekeeper provides a structured space to develop fictional worlds and keep their stories consistent.

> **Status:** In Development

## Overview

Building a fictional universe often means managing large amounts of information across scattered documents and notes.

Lorekeeper aims to solve this by bringing worldbuilding materials into a centralized workspace. Each universe can have its own encyclopedia, timeline, and collection of lore entries.

The goal is to make worldbuilding more organized without taking away the creative freedom behind it.

## Features

Planned and developing features include:

- **Universe Management** — Create and organize multiple fictional universes.
- **Lore Encyclopedia** — Store and manage characters, locations, factions, objects, and other worldbuilding entries.
- **Timeline** — Organize important events and historical moments chronologically.
- **Lore Editor** — Create and edit detailed lore entries.
- **Discover** — Explore fictional universes and their worldbuilding content.
- **Authentication** — User registration and login.
- **Responsive Interface** — A workspace designed for desktop, tablet, and mobile screens.

*Features are being implemented progressively.*

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS v4
- React Router
- React Hook Form
- Zod
- Lucide React

### UI & Development
- shadcn-style UI components
- Class Variance Authority (CVA)
- clsx
- tailwind-merge

## Design Direction

Lorekeeper follows a visual direction inspired by:

- Dark Academia
- Fantasy Encyclopedia
- Modern Editorial Design

The interface uses a dark, muted color palette, editorial typography, and subtle gold and sage accents to create an atmosphere inspired by fictional archives and ancient libraries.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AryaPanji-VA/LoreKeeper.git
   ```

2. Navigate to the project directory:

   ```bash
   cd LoreKeeper
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run lint` | Run ESLint |

## Project Structure

```text
src/
├── components/
│   ├── shared/
│   └── ui/
├── hooks/
├── layouts/
├── lib/
├── pages/
├── routes/
└── services/
```

## Roadmap

- [x] Initial project setup
- [x] Routing structure
- [x] Initial UI primitives
- [ ] Application shell
- [ ] Authentication pages
- [ ] Dashboard
- [ ] Universe management
- [ ] Lore encyclopedia and editor
- [ ] Timeline
- [ ] Discover page
- [ ] Backend integration
- [ ] Final responsive and visual audit

## Project Goals

Lorekeeper is being developed as an academic web application project, with a focus on:

- Component-based frontend architecture
- Responsive UI development
- Form handling and validation
- Application routing
- Data organization and management
- Scalable application structure

## License

This project is currently developed for educational purposes. Licensing details will be added later.
