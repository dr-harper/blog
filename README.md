# mikeyharper.uk

[![Netlify Status](https://api.netlify.com/api/v1/badges/bbe681a0-c05f-4d09-8cb2-401ea1e9bc51/deploy-status)](https://app.netlify.com/projects/mikey/deploys)
![Astro](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

Personal blog and portfolio at [mikeyharper.uk](https://mikeyharper.uk). Data scientist working in the UK energy industry — mostly Python, Google Cloud, and too many Jupyter notebooks.

![Homepage screenshot](https://mikeyharper.uk/images/profilePic.jpg)

## Why the rewrite?

The previous site was built with [Hugo](https://gohugo.io/) and [blogdown](https://bookdown.org/yihui/blogdown/), which served well for academic-style R Markdown posts. But the tooling aged — Hugo pinned at v0.75, R dependencies bit-rotting, and the theme becoming harder to customise.

The new stack solves all of that:

- **Astro 5** — static site generation with zero-JS by default, islands architecture for interactive bits
- **React islands** — interactive components (animated stats, GitHub heatmap, terminal 404, command palette) hydrate only when needed
- **Tailwind CSS v4** — dark/light theme with CSS custom properties, no config file
- **MDX** — blog posts with embedded React components where needed
- **Pagefind** — static search index built at deploy time, no external service

The 23 blog posts were migrated from `.Rmd`/`.html` to `.mdx`, preserving all R-generated figures and interactive htmlwidgets via iframes.

## Features

- **Dark/light theme** with system preference detection and manual toggle
- **Animated Shinkansen landscape** — SVG bullet train with wind turbines, solar panels, power lines, and a house with a heat pump. Sun/moon switches with the theme
- **Terminal 404** — interactive command-line error page with easter eggs
- **Command palette** (Ctrl+K) — fuzzy search across all pages, posts, and projects
- **Reading time & progress bar** — remark plugin calculates reading time at build, progress bar tracks scroll position
- **Table of contents** — floating sidebar on wide screens with active section highlighting
- **Related posts** — tag-overlap scoring at build time, no external services
- **Blog log view** — terminal-style `tail -f` feed as an alternative to the card grid
- **GitHub contribution heatmap** — fetched at build time via GitHub GraphQL API
- **Career timeline** — interactive git-log-styled work history
- **RSS feed & sitemap** — auto-generated

## Tech stack

| Layer | Tools |
|-------|-------|
| Framework | Astro 5, React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS custom properties |
| Content | MDX, Pagefind search, remark plugins |
| Charts | Recharts, Plotly (via htmlwidget iframes) |
| Hosting | Netlify, static site generation |
| CI | Netlify auto-deploy on push to `master` |

## Project structure

```
src/
  components/
    react/          # Interactive React islands
    *.astro         # Static Astro components
  content/
    blog/           # MDX blog posts
    projects/       # MDX project write-ups
  layouts/          # Page layouts (Base, Post, Project)
  pages/            # File-based routing
  styles/           # Global CSS with theme variables
  utils/            # Remark plugins, GitHub API, helpers
public/
  images/           # Static images
  post/             # Legacy R-generated figures and htmlwidgets
```

## Commands

| Command           | Action                                     |
| :---------------- | :----------------------------------------- |
| `npm install`     | Install dependencies                       |
| `npm run dev`     | Start local dev server at `localhost:4321` |
| `npm run build`   | Build production site to `./dist/`         |
| `npm run preview` | Preview build locally before deploying     |

## Licence

Content (blog posts, images) is copyright. Code is MIT.
