# AGENTS.md

You are the implementation agent for the Meliar storefront.

Your role is to design and build a compact, modern, mobile-first fashion storefront using:
- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui where useful
- lucide-react

The current goal is not to build a full ecommerce platform. The current goal is to build the public storefront first, with a catalog experience and a WhatsApp checkout trigger.

Your output must feel commercially credible, visually consistent, compact, mobile-first, and implementation-ready.

## Project context

Meliar is a women's fashion store starting its digital structure.

The first version should work as:
- public website
- product catalog
- product detail pages
- local cart / bag
- WhatsApp checkout trigger

The first version must not include:
- online checkout
- payment gateway
- shipping calculation
- automated fiscal flow
- full admin panel
- Supabase integration
- stock control
- sales registration
- Docker
- custom CI/CD

Those are future phases.

## Core mission

Build a fashion storefront that combines:
- the visual cleanliness and product focus of premium storefronts
- the commercial clarity of a modern women’s fashion store
- compact layout with restrained styling
- strong mobile usability
- minimal friction in scanning products and categories
- a clear path from product browsing to WhatsApp contact

The frontend must not feel like a generic AI landing page.

## Current implementation scope

Current scope:
1. Build the public website structure.
2. Build the home page.
3. Prepare the manual typed catalog data model.
4. Build the PLP / product listing page.
5. Build the PDP / product detail page.
6. Build the local cart / bag.
7. Build the WhatsApp checkout message and URL.
8. Prepare the project for Vercel deployment.

Implementation order:
1. Project base and folder structure.
2. Global layout.
3. Header and footer.
4. Home page.
5. Product data model.
6. Product card component.
7. PLP.
8. PDP.
9. Cart.
10. WhatsApp checkout.
11. Deploy preparation.

Do not jump directly to cart, Supabase, backend, admin, or stock control before the public storefront, PLP, and PDP are stable.

## Non-negotiable constraints

- No emojis anywhere.
- No gradients.
- No oversized hero sections.
- No excessive spacing.
- No long marketing paragraphs.
- No decorative sections without a clear purpose.
- No random visual effects.
- No cluttered headers.
- No inconsistent icon styles.
- No oversized buttons unless explicitly justified.
- No “luxury” clichés with huge empty whitespace.
- No generic filler copy.
- No fake “best sellers” section before real sales data exists.
- No online checkout behavior in the first version.
- No stock reduction when a user clicks the WhatsApp button.

## Language rules

The user-facing product must be written in Brazilian Portuguese (pt-BR).

That includes:
- navigation labels
- buttons
- headings
- helper text
- product UI text
- filters
- sorting labels
- empty states
- validation messages
- banners
- footer content
- promotional copy
- WhatsApp checkout message

Code and technical artifacts must be written in English.

That includes:
- variable names
- function names
- component names
- file names
- folder names
- interfaces
- types
- enums
- utility names
- comments when needed
- commit-oriented technical naming

Rules:
- UI language = pt-BR
- code language = English
- technical structure = English
- customer-facing text = pt-BR

Do not mix Portuguese and English arbitrarily.

## Product strategy

This is a product-first storefront.

That means:
- products must appear early
- categories must be quick to access
- filters and sorting must be simple
- product cards must be visually dominant
- copy must be secondary to the merchandise
- the user should reach browsing fast
- the WhatsApp flow must be obvious but not visually noisy

Do not design the page as a brand manifesto.
Do not over-prioritize storytelling over shopping.

Because the store is still early and may have few products, avoid sections that depend on large volume or sales history.

Preferred early-stage home sections:
- compact hero
- category shortcuts
- novidades / peças selecionadas
- how to buy via WhatsApp
- short about section
- Instagram / social proof section
- footer

Avoid early-stage sections such as:
- mais vendidos
- avaliações de clientes
- ranking de produtos
- complex promotional blocks
- large campaign pages without enough content

## Layout direction

The UI should combine:
- clean, premium, product-led browsing
- compact spacing
- restrained use of color
- strong image-first product presentation
- fast access to products and categories

### Mobile

Mobile is the primary breakpoint.

Requirements:
- one product per row in listing pages
- large product image area
- compact header
- drawer menu for navigation
- horizontal category chips if useful
- filter and sort controls must be accessible without crowding the layout
- product information must remain concise and scannable
- cart interactions must be touch-friendly

### Tablet

- 2 columns for product grids when appropriate
- maintain compact vertical rhythm
- preserve readability and touch targets

### Desktop

- 3 to 4 columns for product listings depending on available width
- avoid giant empty areas
- avoid overly spread-out layouts
- keep content inside sensible max widths
- preserve a clean premium feel without becoming sparse

## Navigation model

Preferred structure:
- optional top shipping or promo strip
- compact main header
- drawer menu on mobile
- clean inline navigation on desktop
- category shortcuts or chips where helpful
- filter and sort controls near the product list
- cart / bag access visible but not dominant

Do not overload the navigation with too many competing elements.

Preferred public routes:

```txt
/
/catalogo
/produto/[slug]
/carrinho
```

Future admin routes, not implemented now:

```txt
/admin
/admin/produtos
/admin/estoque
/admin/vendas
```

## Listing page rules

Listing pages are a priority.

Requirements:
- mobile must display 1 product per row
- tablet may display 2 per row
- desktop may display 3 or 4 per row
- product image should dominate the card
- title should be short
- price must be clear
- supporting text must be minimal
- avoid large descriptions under products
- avoid noisy badges
- sale or highlight badges should be restrained
- filters must be simple and useful

Initial filters can include:
- category
- size
- color

Avoid complex filters until there are enough products to justify them.

## Product card rules

Each card should emphasize:
- image
- product name
- price
- optional short secondary info
- optional quick action if it improves UX

Cards must:
- be compact
- have consistent internal spacing
- avoid unnecessary containers inside containers
- avoid excessive shadows
- avoid visual heaviness
- look aligned as a system, not as isolated experiments

## Product detail page rules

The PDP must be clear and commercial.

Required elements:
- product gallery
- product name
- price
- color selection when available
- size selection when available
- quantity selector when useful
- add to cart / add to bag button
- direct WhatsApp action if useful
- short description
- composition / fabric information when available
- related products only when there are enough products

Do not overload the PDP with ecommerce features that are not implemented, such as online freight calculation, online payment, coupon logic, or account checkout.

## Cart and WhatsApp checkout rules

The cart does not create a real order in the first version.

The cart can be local-only using browser state and localStorage.

The checkout button must generate a structured WhatsApp message containing:
- greeting
- product name
- selected color
- selected size
- quantity
- unit price
- subtotal
- order total
- request to combine delivery and payment

The message must be clear, short, and customer-friendly.

Do not reduce stock when the customer clicks the WhatsApp button.
Do not treat the WhatsApp trigger as a confirmed sale.
A sale is only confirmed in a future admin flow.

Preferred utility structure:

```txt
lib/
  whatsapp/
    build-whatsapp-message.ts
    build-whatsapp-url.ts
```

## Data strategy for now

For the first version, products must be stored in local typed files, not in a database.

Preferred structure:

```txt
data/
  products.ts
  categories.ts

types/
  product.ts
  cart.ts

lib/
  catalog/
    get-products.ts
    get-product-by-slug.ts
  whatsapp/
    build-whatsapp-message.ts
    build-whatsapp-url.ts
```

Pages and components should not import raw product arrays directly when avoidable.

Prefer catalog access functions such as:
- `getProducts()`
- `getProductBySlug()`
- `getFeaturedProducts()`
- `getProductsByCategory()`

This allows the data source to later move to Supabase without rewriting the UI.

## Future data strategy

The project should remain prepared for:
- Supabase database
- Supabase Auth
- Supabase Storage
- admin product editor
- stock by variant
- sales registration
- inventory movements
- reporting
- possible future migration to Nuvemshop or another ecommerce platform

Do not implement these now unless explicitly requested.

Keep the current code simple enough that these future evolutions do not require rewriting the public UI from scratch.

## Copy rules

Use short, commercial, restrained copy.

Do:
- use short section titles
- use short CTA labels
- use short chip labels
- reduce text wherever possible
- be direct about WhatsApp checkout
- be honest about regional delivery and manual payment negotiation

Do not:
- write long brand monologues
- generate filler text
- create fake emotional storytelling
- use exaggerated ad language
- claim best sellers without real sales data
- imply online payment exists if it does not

## Visual style

The brand direction is:
- feminine
- modern
- clean
- commercial
- compact
- premium but not cold

The UI should feel polished and intentional, not ornamental.

## Color system

Use a restrained pink / white / black system.

Primary palette:
- `#f74780`
- `#fc6998`
- `#fa8fb1`
- `#ffc1d5`
- `#ffe4ec`
- `#ffffff`
- `#111111`

Color rules:
- pink is an accent and action color, not a full-page background strategy
- use white or very light surfaces as the base
- use near-black for text and core structure
- use pink for CTA, active states, selected chips, small badges, highlights, and accents
- use lighter pinks for subtle surfaces, hover states, and soft emphasis
- maintain strong contrast
- avoid low-contrast pink-on-pink text
- avoid flooding the interface with saturated pink

## Spacing rules

This project must avoid oversized spacing.

Required spacing behavior:
- compact section spacing
- compact card padding
- controlled vertical rhythm
- controlled gaps between grid items
- no giant top/bottom padding blocks
- no huge empty hero gaps
- no unnecessary whitespace between heading and content

When in doubt, tighten the layout slightly.

## Icon rules

Use icons intentionally and sparingly.

Preferred icon usage:
- menu
- search
- cart / bag
- account only when needed
- wishlist only if needed
- filter
- sort
- shipping/trust markers only if useful

Icons must:
- support scanability
- improve UX
- remain visually consistent
- avoid decorative overuse

Use lucide-react by default.

## Responsiveness rules

Every UI decision must pass this check:
- does it work well on mobile first?
- is it still compact on desktop?
- does it avoid wasted space?
- does the hierarchy stay clear across breakpoints?
- do controls remain accessible on smaller screens?

Do not build desktop-first and shrink it afterward.

## Implementation rules

- use TypeScript
- use Next.js App Router conventions
- keep components modular but not fragmented
- avoid overengineering
- avoid unnecessary abstraction
- avoid introducing state libraries unless needed
- prefer reusable UI primitives
- prefer maintainable code over clever code
- use shadcn/ui where it adds structure and consistency
- use Tailwind classes with readable composition
- keep file structure clean and practical
- inspect existing files before creating replacements
- do not rewrite the entire project unless the task explicitly asks for a migration or rebuild

## Environment and secrets

Use `.env.local` for local environment variables.
Do not commit real environment values.

Commit only `.env.example` with placeholder values.

Public browser-safe values must use `NEXT_PUBLIC_`.
Private server-only secrets must not use `NEXT_PUBLIC_`.

For the first version, likely environment variables include:

```txt
NEXT_PUBLIC_STORE_NAME=Meliar
NEXT_PUBLIC_WHATSAPP_NUMBER=5500000000000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Future Supabase variables may include:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose private keys to client components.

## Git and deployment rules

Keep commits focused.
Prefer small implementation steps.

Recommended branch flow:
- `main` for production-ready code
- feature branches for changes

Vercel deployment is expected later.
Do not add custom CI/CD or Docker unless explicitly requested.

## Decision priorities

When making tradeoffs, prioritize in this order:
1. mobile usability
2. product visibility
3. compact clarity
4. visual consistency
5. accurate WhatsApp purchase flow
6. brand accenting
7. decorative polish

## Anti-patterns to avoid

Never produce:
- oversized landing page hero
- huge blank spaces
- very tall headers
- giant promotional banners
- card grids that become weak on mobile
- two-column mobile product cards
- long copy blocks under products
- too many competing badges
- random border radius changes
- color overuse
- gradient backgrounds
- noisy animations
- inconsistent spacing scales
- fake best-seller sections
- UI that looks generated rather than designed
- checkout behavior that implies online payment exists
- backend/admin/Supabase work before the public storefront is stable

## Final self-check before output

Before finalizing any UI, verify:
- Is mobile the strongest version?
- Is the layout compact enough?
- Is the product visible early enough?
- Is there any unnecessary text?
- Is pink used with restraint?
- Are icons actually helping?
- Is there too much empty space?
- Does the page feel like a real fashion storefront rather than a template?
- Is the WhatsApp flow clear and honest?
- Is the implementation still within the current scope?

If the answer is no to any of the above, revise before final output.
