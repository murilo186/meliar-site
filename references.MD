# REFERENCES.md

## Purpose

This file indexes the visual references used to guide Melier’s storefront prototype.

It exists to reduce ambiguity when interpreting screenshots, inspiration links, and mock assets.

Use this file together with:
- agents.md
- skills.md
- PROJECT.md

Priority order:
1. agents.md for hard constraints
2. PROJECT.md for brand and product direction
3. REFERENCES.md for visual interpretation
4. skills.md for implementation patterns

## Reference sources

### Class Official
Reference link:
- https://classofficial.com.br/collections/fall-26

Why it matters:
- strong product-first browsing
- clean structure
- compact visual rhythm
- good category chip behavior
- simple filter and sort controls
- strong mobile listing direction
- useful drawer / sidebar navigation pattern

Approved takeaways:
- mobile can and should prioritize large product exposure
- 1 product per row on mobile is a strong direction
- chips are useful for quick category access
- filters should be light and practical
- the page should feel clean and premium without relying on excess whitespace

Do not copy literally:
- logo
- typography
- exact spacing values
- exact branding
- brand-specific layout identity

---

### Blair Collection
Reference link:
- https://blaircollection.com.br/

Why it matters:
- stronger visual impact on entry
- more commercial homepage energy
- more lifestyle-driven product imagery
- a more feminine and direct retail tone

Approved takeaways:
- homepage should feel visually attractive, not only functional
- product presentation can feel more alive and commercially appealing
- imagery can help create stronger first impression

What to avoid:
- weak mobile vitrines
- noisier product browsing
- too many competing promotional elements
- layouts that lose control on smaller screens

## Available screenshots

### /docs/references/class-mobile-menu.png
Use for:
- mobile drawer behavior
- compact mobile navigation structure
- simple category stack
- restrained menu design

What to learn from it:
- menu should be easy to scan
- navigation should not feel crowded
- mobile side navigation can be simple and effective

Do not interpret as:
- final visual style for Melier
- exact typography or spacing recipe

---

### /docs/references/class-product-grid-mobile.png
Use for:
- mobile collection page structure
- single-column product listing
- mobile chips
- compact filter and sort row
- image-first product browsing

What to learn from it:
- one product per row is appropriate
- products feel more premium when given stronger visual space
- compact controls can still remain useful

Do not interpret as:
- a mandate to remove all personality
- exact final styling

---

### /docs/references/class-product-grid-desktop.png
Use for:
- desktop catalog density
- clean grid rhythm
- restrained top controls
- product-first hierarchy

What to learn from it:
- desktop should remain clean and efficient
- product cards can stay visually dominant
- top controls should not overpower the grid

Do not interpret as:
- justification for sparse desktop layouts
- justification for weak brand presence

---

### /docs/references/blair-homepage.png
Use for:
- homepage impact
- visual energy
- stronger commercial appeal
- inspiration for feminine storefront tone

What to learn from it:
- the homepage can feel stronger and more alive than a plain catalog
- imagery can create immediate appeal
- the storefront should not feel cold or sterile

Do not interpret as:
- permission to create clutter
- permission to overload the page with promotions
- permission to make the mobile layout unstable

---

### /docs/references/blair-mobile-grid.png
Use for:
- identifying mobile problems to avoid
- understanding what happens when product browsing loses clarity

What to learn from it:
- mobile browsing can degrade when cards, offers, and CTAs compete too much
- visual appeal is not enough if the grid becomes weaker to scan

Avoid:
- unstable mobile card rhythm
- too many emphasis points inside one card
- noisy listing behavior

---

### /docs/references/melier-palette.png
Use for:
- approved color palette
- pink system reference
- design consistency

Approved palette:
- #f74780
- #fc6998
- #fa8fb1
- #ffc1d5
- #ffe4ec

Interpretation:
- pink should be controlled
- white or very light backgrounds should dominate
- black or near-black should carry typography and structure
- lighter pink tones are for subtle emphasis, selected states, and soft surfaces

Do not:
- flood pages with saturated pink
- create pink-heavy full-page backgrounds without strong reason
- use gradients

## Mock asset usage

If the project includes files in:
- /public/mock

Then those files should be treated as temporary prototype assets.

Examples:
- product photos
- hero placeholders
- collection images
- banners

Rules:
- use /public/mock files inside the prototype UI
- do not confuse them with inspiration screenshots
- use inspiration screenshots for structure and visual interpretation
- use mock assets for rendering the actual interface

## Interpretation rules

When multiple references exist, combine them like this:

For homepage:
- take stronger initial appeal from Blair
- keep the structure controlled and compact
- avoid noise

For collection pages:
- take structure mainly from Class
- use compact controls
- keep the product image as the main focal point

For mobile:
- follow the Class direction more strongly
- keep one product per row
- keep controls simple
- maintain compact spacing

For desktop:
- preserve clean catalog rhythm
- allow 3 to 4 columns depending on width
- avoid overly stretched layouts

## Negative guidance

Reject solutions that produce:
- mobile grids with weak hierarchy
- oversized landing-page hero sections
- excessive padding
- long text blocks
- pink overuse
- too many promotional elements fighting for attention
- UI that feels generated rather than intentionally designed

## Quick summary for the agent

Melier should look like:
- a clean, compact, mobile-first fashion storefront
- product-first like Class
- with some of the stronger visual entry energy seen in Blair
- but more controlled, cleaner, and more responsive than Blair on mobile

When unsure:
- prefer compactness
- prefer product clarity
- prefer mobile usability
- prefer restrained styling