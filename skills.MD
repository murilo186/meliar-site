    # skills.md

## Skill: Melier Storefront Composition

Use this skill whenever building or revising a page for the Melier storefront.

Goal:
Create a compact, product-first ecommerce interface with clean hierarchy, minimal copy, strong image presence, and good responsiveness.

Preferred page composition:
- top shipping/promo strip
- compact main header
- optional category shortcuts
- filter and sort controls
- product grid
- optional featured collection blocks
- concise footer

Rules:
- do not let branding overpower product browsing
- avoid unnecessary sections
- every section must justify its existence
- prefer short scanning paths from entry to product discovery

---

## Skill: Compact Ecommerce Density

Use this skill to avoid oversized AI layouts.

Principles:
- tighter vertical rhythm
- moderate padding
- efficient scanning
- dense but readable product presentation
- controlled whitespace

Apply these behaviors:
- section spacing should be compact
- heading spacing should be restrained
- cards should not waste vertical space
- avoid oversized wrappers and containers
- avoid giant breathing room around basic content
- prefer slightly tighter layouts over inflated ones

Red flags:
- huge hero padding
- empty gaps between sections
- oversized buttons
- large margins with little information value

---

## Skill: Product Listing Optimization

Use this skill for collection pages, category pages, and shop views.

Rules:
- mobile = 1 product per row
- tablet = usually 2 products per row
- desktop = 3 or 4 products per row
- image should dominate the card
- title should stay compact
- price should be immediately visible
- secondary details must be restrained
- avoid long descriptions below products
- keep listing pages fast to scan

Preferred listing structure:
- category title or chips
- compact filter/sort row
- image-first product list
- optional pagination or load more

---

## Skill: Product Card Design

Use this skill whenever creating a product card.

Card anatomy:
- image
- name
- price
- optional old price / pix / installment info
- optional action

Card rules:
- keep text short
- use consistent spacing
- keep image area prominent
- do not overdecorate the card
- avoid too many badges
- avoid heavy framing unless strategically useful
- keep actions obvious and minimal

A product card should feel premium through restraint, not through complexity.

---

## Skill: Header and Navigation

Use this skill for header, mobile nav, and category access.

Mobile:
- compact header
- drawer menu for navigation
- search and cart should remain quick to access
- keep the top area light and efficient

Desktop:
- clean header
- avoid clutter
- keep nav readable
- make search/cart/account easy to find
- do not create oversized header height

Navigation should help browsing, not compete with it.

---

## Skill: Sidebar and Filter Patterns

Use this skill for category navigation and filtering.

Guidelines:
- mobile should prefer a drawer or sheet
- desktop should prefer inline top filters unless a sidebar is truly necessary
- filters must be easy to understand
- sort control should remain simple
- chip-style categories are encouraged when they reduce friction
- avoid enterprise-style heavy filter panels for a fashion storefront

Filter UI should feel light, not administrative.

---

## Skill: Brand Color Discipline

Use this skill whenever applying colors.

Palette:
- #f74780
- #fc6998
- #fa8fb1
- #ffc1d5
- #ffe4ec
- #ffffff
- #111111

Usage strategy:
- white / very light base
- black / near-black structure and text
- pink for actions and emphasis
- light pink for soft surfaces and selected states

Do:
- keep color application controlled
- use pink to create identity and focus
- preserve readability and contrast

Do not:
- make everything pink
- use saturated pink in large uncontrolled blocks
- use gradients
- use low-contrast combinations
- introduce unrelated colors unless required by product media

---

## Skill: Copy Compression

Use this skill whenever generating UI text.

Requirements:
- short labels
- short headings
- short CTA text
- short supporting copy
- commercial and direct language

Examples of preferred style:
- "Novidades"
- "Comprar"
- "Filtrar"
- "Ordenar"
- "Mais vendidos"

Avoid:
- filler storytelling
- generic inspirational copy
- long subheadings
- repeated phrases
- empty brand language

---

## Skill: Icon Restraint

Use this skill when placing icons.

Preferred use cases:
- menu
- search
- cart
- account
- wishlist if needed
- filter
- sort
- trust/shipping cues when justified

Rules:
- icons must improve recognition or speed
- do not add icons as decoration
- keep stroke style consistent
- keep sizing consistent
- use lucide-react

---

## Skill: Mobile-First Validation

Use this skill before finalizing any page.

Validation checklist:
- does the page work naturally on mobile?
- is the listing one column on mobile?
- is the header compact enough?
- are controls reachable and legible?
- does the spacing feel compact rather than inflated?
- is product imagery strong enough?
- are text blocks short enough?
- does the layout remain coherent on larger screens?

If any answer is weak, revise before finalizing.

---

## Skill: Implementation Discipline

Use this skill while writing code.

Rules:
- use TypeScript
- prefer clear component boundaries
- avoid overengineering
- avoid unnecessary state solutions
- keep components reusable but practical
- follow shadcn/ui conventions where useful
- keep Tailwind class usage readable
- choose maintainability over cleverness
- create UI systems, not one-off fragments

Implementation order:
1. define the page structure
2. define reusable sections
3. apply compact spacing and hierarchy
4. ensure mobile behavior works first
5. refine color, icons, and interaction states
6. simplify anything that feels too generated

---

## Skill: Anti-Template Detection

Use this skill to catch generic AI output before finalizing.

Reject or revise output if it contains:
- a huge hero with little value
- excessive whitespace
- decorative sections with weak function
- too much copy
- weak product hierarchy
- inconsistent spacing
- random color use
- oversized cards
- desktop-first layout behavior
- visual polish without commerce clarity

The result must look intentionally designed, not automatically assembled.