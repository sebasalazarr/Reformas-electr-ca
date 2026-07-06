---
name: High-Voltage Precision
colors:
  surface: '#121317'
  surface-dim: '#121317'
  surface-bright: '#38393d'
  surface-container-lowest: '#0d0e12'
  surface-container-low: '#1a1b1f'
  surface-container: '#1e1f23'
  surface-container-high: '#292a2e'
  surface-container-highest: '#343539'
  on-surface: '#e3e2e7'
  on-surface-variant: '#ddc1ae'
  inverse-surface: '#e3e2e7'
  inverse-on-surface: '#2f3034'
  outline: '#a48c7a'
  outline-variant: '#564334'
  surface-tint: '#ffb77d'
  primary: '#ffb77d'
  on-primary: '#4d2600'
  primary-container: '#ff8c00'
  on-primary-container: '#623200'
  inverse-primary: '#904d00'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#a9aaaa'
  on-tertiary-container: '#3d3f3f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#121317'
  on-background: '#e3e2e7'
  surface-variant: '#343539'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  bento-gap: 20px
---

## Brand & Style

This design system is engineered for a premium electrical services brand, blending technical authority with high-end aesthetic precision. The personality is professional, energetic, and dependable, designed to evoke immediate trust through a clean, systematic interface.

The visual style is a fusion of **Modern Corporate** and **Minimalism**, heavily inspired by the "Apple/Stripe" aesthetic. It utilizes generous negative space to emphasize high-contrast typography and "Bento Box" layouts to organize complex service offerings into digestible, beautiful modules. The interface relies on deep dark backgrounds to allow the vibrant primary orange to act as a literal "spark" of energy throughout the user journey.

## Colors

The palette is anchored in a deep **Charcoal/Black** (`#121212`) to establish a premium, industrial feel. The **Electric Orange** (`#FF8C00`) serves as the primary action color, used strategically for buttons, critical icons, and emphasis in headlines to represent power and urgency.

- **Primary:** Electric Orange for high-priority calls to action and branding.
- **Surface:** Deep Charcoal for the main background.
- **Text Primary:** Pure White (`#FFFFFF`) for maximum legibility on dark surfaces.
- **Text Secondary:** Soft Gray (`#8E8E93`) for metadata, descriptions, and labels.
- **Accents:** Subtle orange glows (15-20% opacity) are used for "charging" effects behind key cards or buttons.

## Typography

This design system uses **Inter** exclusively to maintain a clean, systematic, and functional appearance. The typographic hierarchy is aggressive, with large, bold headlines that create a clear entry point for users.

Tight letter spacing is applied to large headings to maintain a modern, "tech-heavy" feel. Body text remains spacious to ensure readability against dark backgrounds. Labels and secondary information utilize a slightly wider tracking and semi-bold weights to differentiate them from body copy without requiring larger font sizes.

## Layout & Spacing

The design system employs a **Fluid Bento Grid** model. Content is housed within rounded containers that snap to a 12-column grid on desktop and a single column on mobile. 

- **Bento Boxes:** Use a consistent 20px gap (`bento-gap`) between modules. For services, modules should vary in width (e.g., a 2/3 and 1/3 split) to create visual interest.
- **Negative Space:** Sections are separated by large vertical buffers (80px - 120px) to prevent the dark UI from feeling cramped.
- **Padding:** Internal card padding is generous (minimum 32px) to ensure content feels premium and unhurried.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Glows** rather than traditional heavy shadows.

- **Surface Levels:** The base background is the darkest level. Cards and Bento containers use a slightly lighter gray or a semi-transparent glass effect to lift off the background.
- **Orange Radiance:** High-priority elements (like the "Emergency Call" button or the main CTA) utilize a soft, diffused orange drop-shadow (`rgba(255, 140, 0, 0.3)`) with a high blur radius (20px+) to simulate a glowing light source.
- **Glassmorphism:** Secondary overlays or floating images use a subtle backdrop blur (12px) and a thin 1px white border at 10% opacity to create a "technical glass" look.

## Shapes

The shape language is consistently **Rounded**, conveying modern approachability while maintaining professional structure. 

Standard components like buttons and input fields use a **12px - 16px corner radius**. Larger containers and Bento boxes utilize the `rounded-xl` (24px) setting to create a soft, friendly "container" feel that contrasts with the technical, sharp nature of electrical work.

## Components

### Buttons
- **Primary:** Solid Electric Orange background, White text, 16px border radius. Features a soft orange outer glow.
- **Secondary:** Ghost style with a 1px White or Orange border and subtle hover fill.
- **Interactions:** On hover, buttons should scale slightly (1.02x) and the outer glow should intensify.

### Bento Cards
- Rounded corners (24px), background color slightly lighter than the page base.
- Content inside follows a "Label -> Heading -> Description" hierarchy.
- Images within bento cards should be clipped to the container or float with a glassmorphism effect.

### Input Fields
- Dark background with a 1px border (`rgba(255, 255, 255, 0.1)`). 
- On focus, the border transitions to Electric Orange with a subtle inner glow.

### Chips & Tags
- Used for "SEC Certified" or "24/7".
- Small, uppercase text with high letter spacing, contained in a pill-shaped stroke or subtle tint of the primary color.