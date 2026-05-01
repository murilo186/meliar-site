# PROJECT.md

## Project name

Melier

## Language direction

Melier is a Brazilian storefront.

Therefore:
- all customer-facing interface text must be in Brazilian Portuguese (pt-BR)
- all technical implementation should remain in English for maintainability and consistency

Examples:
- UI labels: "Comprar", "Filtrar", "Ordenar", "Novidades"
- code naming: `ProductCard`, `product-list.tsx`, `formatCurrency`

## Project type

Frontend prototype for a women’s fashion ecommerce storefront.

## Objective

Build a visually strong, commercially credible storefront prototype for Melier using React, Vite, TypeScript, Tailwind CSS, shadcn/ui, and lucide-react.

This prototype is intended to define the visual and structural direction of the brand’s storefront before deeper implementation.

The goal is not to create a generic landing page.
The goal is to create a compact, product-first ecommerce experience with strong mobile behavior and clear browsing flow.

## Brand direction

Melier should feel:
- feminine
- modern
- clean
- commercial
- compact
- polished
- contemporary

It should not feel:
- overly luxurious with excessive whitespace
- editorial to the point of hurting usability
- visually noisy
- crowded
- generic or template-like
- childish
- exaggerated

## Commerce direction

Melier is a browsing-first store.

That means:
- products must appear early
- navigation must be clear
- categories must be easy to access
- product cards must be strong
- product imagery matters more than long text
- the store must feel fast to scan
- mobile browsing quality is critical

## Design preferences

Approved visual traits:
- compact layout
- strong product focus
- restrained use of pink
- white or very light surfaces
- black or near-black text
- subtle rounded elements when useful
- good icon usage
- short labels and short text blocks
- modern but practical ecommerce structure

Avoid:
- gradients
- emojis
- oversized hero blocks
- long brand storytelling
- too much empty space
- giant buttons
- decorative-only sections
- overdesigned cards
- random animations
- multiple competing focal points

## Color direction

Primary palette:
- #f74780
- #fc6998
- #fa8fb1
- #ffc1d5
- #ffe4ec
- #ffffff
- #111111

Usage direction:
- white / very light background base
- black or near-black for text and main structure
- pink for accents, CTA, active states, selected states, and highlights
- lighter pinks for subtle surfaces
- color use must stay restrained and intentional

## Responsive direction

The project is mobile-first.

Required behavior:
- mobile product listings should show 1 item per row
- tablet may show 2 items per row
- desktop may show 3 or 4 items per row
- the mobile experience must feel strong and intentional, not like a compressed desktop page
- spacing must remain compact across breakpoints
- desktop must not become too sparse

## Inspiration references

### Reference 1: Class Official

Reference:
- https://classofficial.com.br/collections/fall-26

What is approved from this reference:
- clean product-first layout
- compact visual rhythm
- attractive product grid structure
- mobile listing with strong product focus
- category chips
- simple filter and sorting controls
- minimal header
- useful sidebar / drawer behavior for navigation

What should influence Melier:
- mobile should prioritize large product presentation
- one product per row on mobile is a good direction
- browsing should feel clean and premium
- filters should not dominate the page
- visual hierarchy should feel controlled

What should not be copied literally:
- brand identity
- logo style
- exact spacing values
- exact typography choices
- any brand-specific visual assets

### Reference 2: Blair Collection

Reference:
- https://blaircollection.com.br/

What is approved from this reference:
- impactful homepage energy
- stronger visual appeal in the opening impression
- lifestyle-oriented product presentation
- commercially direct presentation of products

What should influence Melier:
- homepage should have stronger visual appeal than a purely utilitarian catalog
- product imagery can feel more alive and commercial
- the storefront can feel feminine and commercially attractive without becoming messy

What should be avoided based on this reference:
- weaker mobile vitrines
- layouts that become visually unstable on smaller screens
- too many competing promotional elements
- too much visual noise around the products

## Final direction

Melier should combine:
- the cleaner browsing structure of Class
- the stronger initial visual appeal of Blair
- a compact mobile-first ecommerce layout
- restrained pink branding
- strong product images
- concise copy
- simple, commercially effective navigation

The resulting UI should feel intentional, modern, and real.

## Example page priorities

Pages or sections that matter most in the prototype:
- homepage
- category / collection page
- product listing grid
- mobile header and drawer
- filter and sort interaction
- product card system

## Asset and reference notes

All inspiration links, screenshots, sample images, and visual notes should be stored in a dedicated reference location inside the project so the agent can inspect them consistently.

Suggested folders:
- /docs/references
- /docs/inspirations
- /public/mock
- /public/examples

Use file names that describe what the image is for.

Examples:
- class-mobile-menu.png
- class-product-grid-desktop.png
- blair-homepage-energy.png
- blair-mobile-vitrine-problem.png
- melier-color-palette.png

## Important implementation note

When visual references are available in the repository, the agent should inspect them before making layout decisions.

If both written guidance and reference images exist, the agent should follow:
1. agents.md for hard rules
2. PROJECT.md for brand and design direction
3. skills.md for execution patterns
4. reference images for visual interpretation

## How to use visual references

Reference screenshots may exist inside:
- /docs/references

Mock product or banner assets may exist inside:
- /public/mock

Interpretation rules:
- files in /docs/references are for inspiration and layout guidance
- files in /public/mock are for use in the prototype UI
- do not treat inspiration screenshots as final UI assets
- use them to infer spacing, structure, hierarchy, density, and image treatment