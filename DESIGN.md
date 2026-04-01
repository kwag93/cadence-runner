# Design System Document: High-Performance Athleticism

## 1. Overview & Creative North Star: "The Kinetic Pulse"
The creative north star for this design system is **"The Kinetic Pulse."** 

This isn't just a utility; it is a high-performance instrument. To break away from the "template" look of fitness apps, we lean into **Editorial Modernism**. We achieve this through aggressive typographic scales, intentional asymmetry, and "optical depth." While the runner is in motion, the UI must feel like a HUD (Heads-Up Display) in a premium vehicle—commanding, legible, and alive. 

The system rejects the "boxed-in" layout. By using overlapping elements and unconventional spacing, we create a sense of forward momentum. We don't just display data; we give it a heartbeat.

---

## 2. Colors: Depth Through Light
The palette is rooted in the depth of a midnight run. We use a "Super-Dark" slate foundation to make the Emerald Green (`primary`) feel like it’s glowing with radioactive energy.

*   **Primary (`#69f6b8`):** Use this for the "pulse" of the app—cadence numbers and active states. 
*   **Secondary/Tertiary (`#5afcd2`, `#77e6ff`):** Used for accent metrics (e.g., oscillation, ground contact time) to provide a sophisticated multi-tonal green/cyan spectrum.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through background color shifts. For example, a workout summary card (`surface-container-low`) sits on the main `background` without a stroke. Separation is achieved through value, not lines.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of tinted glass.
*   **Base:** `surface` (#070d1f)
*   **Secondary Content:** `surface-container-low` (#0c1326)
*   **Interactive Cards:** `surface-container` (#11192e)
*   **Floating Elements:** `surface-bright` (#222b47) with a 20px backdrop-blur.

### The "Glass & Gradient" Rule
To ensure the UI feels custom and "high-end," use subtle linear gradients on primary CTAs. Transition from `primary` (#69f6b8) at the top-left to `primary_container` (#06b77f) at the bottom-right. This prevents the "flat-asset" look and adds a tactile, pressurized feel to buttons.

---

## 3. Typography: Readability at Pace
The system utilizes **Geist** (interpreted here via `spaceGrotesk` for high-impact displays and `inter` for utility) to maintain a technical, engineered aesthetic.

*   **Display-LG (3.5rem):** Reserved for the current Cadence (BPM). This must be the "hero" of the screen.
*   **Headline-MD (1.75rem):** For secondary metrics like "Distance" or "Time Remaining."
*   **Body-LG (1rem):** For instructional text and settings.
*   **Label-MD (0.75rem):** For unit descriptors (e.g., "SPM", "MINS"). Use `tracking-widest` (letter spacing) to give these an editorial feel.

**Editorial Tip:** Use intentional size contrast. Pair a `Display-LG` metric with a `Label-SM` descriptor placed asymmetrically to the top-right of the number to create a "technical blueprint" look.

---

## 4. Elevation & Depth: Tonal Layering
We do not use standard Material Design drop shadows. Instead, we use **Ambient Tonal Glows.**

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-highest` element should only ever sit on a `surface-container-low` background. This "stepped" value approach creates natural hierarchy.
*   **Tactile Glows:** For interactive elements (like the 'Start' button), apply an outer glow using the `primary` color at 15% opacity with a 30px blur. This makes the element appear to emit light, aiding visibility in low-light running conditions.
*   **The Ghost Border Fallback:** If accessibility requires a container edge, use `outline_variant` (#41475b) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Navigation bars and modal overlays must use `surface_container` with a `0.8` alpha and a `backdrop-filter: blur(12px)`. This allows the kinetic movement of the background metrics to be partially visible, maintaining the "HUD" feel.

---

## 5. Components: Engineered Utility

### The Metronome Pulse (Custom Component)
A central visual element. A circle using `primary` that expands and fades out (scale 1.0 to 1.5, opacity 100% to 0%) in sync with the BPM.

### Buttons: The Kinetic Trigger
*   **Primary:** Large (height: `6`), `md` (12px) roundedness. Background: Gradient of `primary` to `primary_container`. Text: `on_primary` (Bold).
*   **Secondary:** Ghost style. No background, `outline_variant` at 20% opacity. 
*   **Interactive State:** On press, the element should "shrink" slightly (scale 0.98) and the glow intensity should increase.

### Cards & Lists: Flow over Friction
*   **Strict Rule:** No dividers. Use `spacing-6` (2rem) of vertical whitespace to separate workout history items. 
*   **Layout:** Use asymmetrical padding (e.g., `padding-left: 5`, `padding-right: 3`) to create a more dynamic, editorial rhythm.

### Cadence Slider
A custom horizontal scroll using `spacing-px` ticks. The center "active" tick is `primary` and twice the height of others.

---

## 6. Do's and Don'ts

### Do:
*   **Do** embrace massive typography. If a runner can't read the BPM from 3 feet away while bouncing, the design has failed.
*   **Do** use `primary` sparingly. It is a signal, not a decoration.
*   **Do** utilize the `surface_container_highest` for the "active" state of a toggle or card to create a "lift" effect.

### Don't:
*   **Don't** use pure white (#FFFFFF). Use `on_surface` (#dfe4fe) to reduce eye strain in dark environments.
*   **Don't** use standard 1px dividers. They create "visual noise" that clutter the high-performance feel.
*   **Don't** use standard "Material" shadows. If it looks like a generic Android app, it isn't "The Kinetic Pulse."