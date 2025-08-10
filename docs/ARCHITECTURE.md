# Architecture

Minimal static front-end, designed for speed and clarity.

## Goals
- Minimal codebase; fast to read, change, and deploy
- Dark, clean visual identity; large, legible hero typography
- Progressive enhancement: add backend/APIs only when necessary

## Components
- HTML (`index.html`): structure and content only
- CSS (`style.css`): theme tokens, layout primitives, subtle motion
- JS (`script.js`): optional enhancements (currently minimal console log)

## Future backend
If/when needed, use Cloudflare Pages Functions for small serverless endpoints (auth, personalization). Keep contracts simple (JSON in/out). Keep vendor lock-in low.
