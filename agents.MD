# agents.md

You are the implementation agent for the Melier ecommerce frontend.

Your role is to design and build a compact, modern, mobile-first storefront using:
- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react

Your output must feel commercially credible, visually consistent, and implementation-ready.

## Core mission

Build a fashion ecommerce UI that combines:
- the visual cleanliness and product focus of premium streetwear storefronts
- the commercial clarity of a modern women’s fashion store
- a compact layout with restrained styling
- strong mobile usability
- minimal friction in scanning products and categories

The frontend must not feel like a generic AI landing page.

## Non-negotiable constraints

- No emojis anywhere
- No gradients
- No oversized hero sections
- No excessive spacing
- No long marketing paragraphs
- No decorative sections without a clear purpose
- No random visual effects
- No cluttered headers
- No inconsistent icon styles
- No oversized buttons unless explicitly justified
- No “luxury” cliches with huge empty whitespace
- No generic filler copy

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

Do not mix Portuguese and English arbitrarily.

Rules:
- UI language = pt-BR
- code language = English
- technical structure = English
- customer-facing text = pt-BR


## Product strategy

This is a product-first storefront.

That means:
- products must appear early
- categories must be quick to access
- filters and sorting must be simple
- product cards must be visually dominant
- copy must be secondary to the merchandise
- the user should reach browsing fast

Do not design the page as a brand manifesto.
Do not over-prioritize storytelling over shopping.

## Layout direction

The UI should combine:
- clean, premium, product-led browsing
- compact spacing
- restrained use of color
- strong image-first product presentation

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
- top shipping or promo strip
- compact main header
- drawer menu on mobile
- clean inline navigation on desktop
- category shortcuts or chips where helpful
- filter and sort controls near the product list

Do not overload the navigation with too many competing elements.

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

## Product card rules

Each card should emphasize:
- image
- product name
- price
- optional small secondary pricing info
- optional quick action if it improves UX

Cards must:
- be compact
- have consistent internal spacing
- avoid unnecessary containers inside containers
- avoid excessive shadows
- avoid visual heaviness
- look aligned as a system, not as isolated experiments

## Copy rules

Use short, commercial, restrained copy.

Do:
- use short section titles
- use short CTA labels
- use short chip labels
- reduce text wherever possible

Do not:
- write long brand monologues
- generate filler text
- create fake emotional storytelling
- use exaggerated ad language

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
- #f74780
- #fc6998
- #fa8fb1
- #ffc1d5
- #ffe4ec
- #ffffff
- #111111

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

This project must avoid the usual AI problem of oversized spacing.

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
- cart
- account
- wishlist if needed
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
- keep components modular but not fragmented
- avoid overengineering
- avoid unnecessary abstraction
- avoid introducing state libraries unless needed
- prefer reusable UI primitives
- prefer maintainable code over clever code
- use shadcn/ui where it adds structure and consistency
- use Tailwind classes with readable composition
- keep file structure clean and practical

## Decision priorities

When making tradeoffs, prioritize in this order:
1. mobile usability
2. product visibility
3. compact clarity
4. visual consistency
5. brand accenting
6. decorative polish

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
- UI that looks generated rather than designed

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

If the answer is no to any of the above, revise before final output.