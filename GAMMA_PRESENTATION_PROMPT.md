# Gamma Presentation Prompt: ApexLogic Virtual Lab

> **Instructions for Gamma (gamma.app):**
> 1. Open [Gamma.app](https://gamma.app) and select **New with AI** → **Paste text**.
> 2. Copy and paste the entire prompt below (from `### START OF GAMMA PROMPT` to `### END OF GAMMA PROMPT`).
> 3. Select **Presentation** mode, set target length to **12 slides**, and choose a **Minimal / Clean / Technical** theme (e.g., "Mono", "Oasis", "Slate", or "Swiss Minimalist" with high contrast, white/off-white background, and subtle cobalt blue accents).

---

### START OF GAMMA PROMPT

**Role & Goal:** You are a senior digital systems engineer and pedagogical software architect. Create an exceptionally clean, modern, and mathematically rigorous 12-slide presentation for engineering college professors and evaluators about **ApexLogic** — a minimalist, zero-dependency browser-only virtual laboratory for Digital Electronics.

**Visual Aesthetic Guidelines:**
- **Style:** Swiss graphic design, Dieter Rams-inspired minimalism, ultra-clean typography, generous whitespace.
- **Palette:** Warm off-white canvas (`#FBFBFB`), deep ink typography (`#09090B`), subtle neutral borders (`#E4E4E7`), cobalt signal blue (`#1D4ED8`) for active states, sage green (`#15803D`) for verified status, amber (`#D97706`) for clock timing.
- **Tone:** Academic, professional, precise, engineering-focused. Avoid cartoonish clipart, low-resolution icons, or generic marketing jargon. Use structured cards, comparative columns, and formula callouts.

---

## Slide 1: Title & Project Identity
**Title:** ApexLogic — Engineering a Modern Virtual Digital Electronics Laboratory
**Subtitle:** Interactive Circuit Simulation, Live Truth-Table Verification, and Automated Academic Lab Records
**Badge / Tagline:** 100% Client-Side • Zero Dependencies • Pedagogical Excellence

**Key Metadata (3 Clean Columns):**
- **Domain:** 1st / 2nd Year Digital Electronics & System Design (CSE / ISE / ECE)
- **Live Deployment:** [https://apexlogicde.netlify.app/](https://apexlogicde.netlify.app/)
- **Core Technology:** Vanilla HTML5 • CSS Custom Properties • Native ES Modules • Inline SVG

**Presenter Note:** "Good morning, professors and evaluators. Today we present ApexLogic — a web-native platform built to solve the practical shortcomings of traditional digital electronics hardware labs through precision simulation, instant feedback, and verifiable academic documentation."

---

## Slide 2: The Physical Lab Dilemma: Why Virtual Labs Matter
**Title:** The Challenge in Traditional Hardware Laboratories
**Subtitle:** The practical gap between Boolean theory and breadboard execution

**Three Critical Pain Points (Card Grid):**
1. **Component Vulnerability & Wear:**
   - Bent pins on dual in-line package (DIP) ICs (7400, 7408, 7486).
   - Loose breadboard contact springs, broken jumper wires, and intermittent open circuits that consume 80% of lab time on mundane hardware debugging.
2. **The "Black Box" Problem:**
   - Multimeter probes slip or short adjacent pins; oscilloscopes are scarce in 60-student batch labs.
   - Students cannot visualize internal intermediate logic nodes (e.g., XOR intermediate terms $X_1, X_2, X_3$).
3. **Verification & Record Anxiety:**
   - Students rush through manual truth table verification without deep understanding.
   - Lab records are copied blindly without verifiable proof that the student systematically tested all binary combinations.

**Core Thesis:** *ApexLogic does not replace hands-on understanding — it accelerates it by providing transparent, repeatable, and interactive digital intuition before or alongside hardware testing.*

---

## Slide 3: Philosophy & Architecture: Zero-Dependency Purity
**Title:** Architectural Philosophy: Zero Build, Zero Bloat
**Subtitle:** Why we rejected heavy frameworks in favor of native web standards

**Comparison Layout (2 Columns):**

* **Traditional Heavy Web Apps (What We Avoided):**
  - Bulky React/Vue/Angular bundles (>5 MB payloads).
  - Webpack/Vite build toolchains that break over time.
  - Opaque black-box simulation libraries and heavy canvas wrappers.
  - Server latency and cloud database requirements for simple student progress.

* **The ApexLogic Architecture (What We Engineered):**
  - **100% Zero-Build:** Vanilla ES modules running directly in modern browsers via HTTP.
  - **Deterministic SVG Schematics:** Built with native `document.createElementNS`, enabling sharp, scalable rendering from mobile screens to 4K displays.
  - **Topological Netlist Evaluator:** Pure mathematical execution loop that evaluates components strictly in order of signal dependency.
  - **Total Privacy & Offline Capability:** Student credentials, visited states, and viva scores reside exclusively in secure `localStorage`.

---

## Slide 4: Real-Time Engine & Schematic Visualization
**Title:** Core Engine & Deterministic Schematic Routing
**Subtitle:** Combining circuit graph evaluation with automated orthogonal wire layout

**Key Engineering Pillars (3 Feature Cards):**
1. **Topological Logic Evaluation (`engine.js`):**
   - Inputs are injected as a bitmask; components evaluate sequentially without recursion or race conditions.
   - Supports logic gate primitives (NOT, AND, OR, XOR, NAND, NOR) and complex functional IC blocks (74153, 7447, T-FF).
2. **Orthogonal Routing Algorithm (`renderer.js`):**
   - Clean, right-angle wire routing that never overlaps gate bodies or illegibly intersects.
   - Automatic junction dot generation ($r = 3\text{px}$) on fan-out nodes ($n > 1$).
   - Dynamic wire recoloring: Active HIGH signals glow Cobalt (`#1D4ED8`, 2px stroke); LOW signals remain subdued Neutral (`#D4D4D8`, 1.5px).
3. **Tactile Human Interface:**
   - Custom-engineered debossed switch physics with 120ms spring cubic-bezier transitions.
   - Built-in Web Audio API synthesizer generating an authentic 8ms micro-click feedback tone.

---

## Slide 5: Experiment 01 — Universal Gate Realization (NAND-Only)
**Title:** Experiment 01: Universal Gate Realization
**Subtitle:** Proving functional completeness using only IC 7400 Quad 2-Input NAND gates

**Overview & Curriculum Goal:**
Demonstrate that any arbitrary combinational logic circuit can be synthesized using exclusively NAND gates, verifying De Morgan's theorems.

**The Four Realizations (4 Clean Grid Blocks):**
* **NOT Gate:** $Y = \overline{A \cdot A} = \overline{A}$ (1 NAND gate)
* **AND Gate:** $Y = \overline{\overline{A \cdot B}} = A \cdot B$ (2 NAND gates)
* **OR Gate:** $Y = \overline{\overline{A} \cdot \overline{B}} = A + B$ (3 NAND gates via De Morgan's inversion)
* **XOR Gate:** $Y = A \oplus B = \overline{\overline{A \cdot X_1} \cdot \overline{B \cdot X_1}}$, where $X_1 = \overline{A \cdot B}$ (4 NAND gates)

**Key Pedagogical Features:**
- Dynamic intermediate node badges showing real-time Boolean expressions: $X_1, X_2, X_3$.
- Live side-by-side Truth Table with a **Native Comparator Column** confirming the NAND network matches the native gate in real time.

---

## Slide 6: Experiment 02 — Half & Full Adder
**Title:** Experiment 02: Arithmetic Logic Circuits
**Subtitle:** Synthesizing binary addition with carry propagation using elementary gates

**Circuit Analysis & Formulations (2 Columns):**

* **Half Adder (2 Inputs: $A, B$):**
  - $\text{Sum} = A \oplus B$ (IC 7486 XOR)
  - $\text{Carry} = A \cdot B$ (IC 7408 AND)
  - Gates used: 2 • Truth table: 4 rows ($00_2$ to $11_2$).

* **Full Adder (3 Inputs: $A, B, C_{\text{in}}$):**
  - $\text{Sum} = A \oplus B \oplus C_{\text{in}}$
  - $C_{\text{out}} = A \cdot B + C_{\text{in}} \cdot (A \oplus B)$
  - Intermediate carry terms ($X_1, X_2, X_3$) probeable directly in schematic.
  - Gates used: 5 • Cascaded half-adder topology with OR combining stage.

**Standout Interactive Feature:**
- **Live Decimal Arithmetic Readout:** Directly above the output lamps, students see live decimal math: e.g., $1_2 + 1_2 + 1_2 = 3_{10} \implies \text{Sum} = 1, C_{\text{out}} = 1$.

---

## Slide 7: Experiment 03 — 4-to-1 Multiplexer (Data Routing)
**Title:** Experiment 03: Data Routing & Selection
**Subtitle:** Channel steering with select lines and active-low enable using IC 74153

**Functional Specifications:**
- **4 Data Channels:** $D_0, D_1, D_2, D_3$ (default preset to $0, 1, 0, 1$ for immediate visual routing).
- **2 Select Lines:** $S_1, S_0$ addressing $2^2 = 4$ independent data paths.
- **Active-Low Enable ($\bar{E}$):** Output $Y = 0$ whenever $\bar{E} = 1$, regardless of select states.

**Mathematical Formulation:**
$$Y = \bar{E} \cdot (\overline{S_1}\,\overline{S_0}\,D_0 + \overline{S_1}\,S_0\,D_1 + S_1\,\overline{S_0}\,D_2 + S_1\,S_0\,D_3)$$

**Visual Innovations:**
- **Dynamic Channel Dimming:** The selected active input wire is highlighted; unselected data channels are dimmed to 45% opacity.
- **Live Equation Highlighting:** The active product term in the mathematical formula turns bold ink in real time, showing the direct link between algebra and signal flow.

---

## Slide 8: Experiment 04 — BCD to 7-Segment Decoder
**Title:** Experiment 04: Code Conversion & Display Driving
**Subtitle:** Decoding 4-bit Binary Coded Decimal to 7-segment cathode signals (IC 7447)

**System Capabilities (2 Columns):**

* **Valid BCD Range ($0000_2$ to $1001_2$ • $0$ to $9$):**
  - Drives segments $a, b, c, d, e, f, g$ inside a crisp, scalable SVG display module.
  - Digit $1$ illuminates segments $b, c$; digit $8$ activates all seven segments.
  - 10 valid truth table rows required for verification.

* **Invalid Code Detection ($1010_2$ to $1111_2$ • $10$ to $15$):**
  - Real-world simulation: non-BCD inputs display an isolated middle dash (segment $g$).
  - Triggers an instant amber/danger warning badge: `Invalid BCD Input (Range: 0–9)`.

**Bidirectional Control Innovation:**
- A custom decimal stepper (`[-] 0 [+]`) stays perfectly synchronized in real time with the 4 binary switches ($B_3, B_2, B_1, B_0$).

---

## Slide 9: Experiment 05 — 3-bit Asynchronous Ripple Counter
**Title:** Experiment 05: Sequential Logic & Frequency Division
**Subtitle:** MOD-8 up-counter with cascaded T flip-flops and integrated Logic Analyzer

**Sequential Circuit Architecture:**
- **Cascaded Flip-Flops:** 3 positive-edge triggered T flip-flops ($T = 1$, toggling on every rising clock edge).
- **Ripple Carry Mechanism:** Stage $n+1$ is clocked by $\overline{Q_n}$, which transitions LOW-to-HIGH precisely when $Q_n$ falls ($1 \to 0$).
- **Counting Sequence:** Natural binary up-count $000_2 \to 111_2$ (0 to 7 decimal) with automatic rollover.

**The Built-in Logic Analyzer (Waveform Strip):**
- A 32-sample scrolling digital waveform displaying 4 synchronized lanes:
  - $\text{CLK}$: High-frequency clock trigger (highlighted in amber).
  - $Q_0$: Frequency divided by 2 ($f/2$).
  - $Q_1$: Frequency divided by 4 ($f/4$).
  - $Q_2$: Frequency divided by 8 ($f/8$).
- Includes manual clock pulse stepping and a variable-speed auto-run oscillator ($0.5\text{ Hz}$ to $4.0\text{ Hz}$).

---

## Slide 10: Interactive Pedagogical Instruments
**Title:** Pedagogical Tooling: De-Blackboxing Digital Circuits
**Subtitle:** Instruments built into the canvas to cultivate genuine diagnostic skills

**3 Core Interactive Tools (Card Grid):**

1. **Floating Logic Probe:**
   - Activated via a toolbar toggle; transforms the cursor into a test bench crosshair.
   - Hovering or tapping any wire or pin reveals a high-precision tooltip:
     - Node name: `NET_X1`, `NET_SUM`, `NET_Q0`
     - Voltage: `+5.0 V (HIGH)` or `0.0 V (LOW)`
     - Binary State: `1` or `0`

2. **Active Truth Table Tracking:**
   - Active-row cursor moves dynamically as switches change.
   - Visited states are recorded automatically and stamped with a sage green checkmark (`✓`).
   - Prevents student omission by visibly requiring all input combinations.

3. **Integrated Viva Voce Quizzes:**
   - 3 rigorous conceptual questions per experiment with immediate option lock and full technical explanations to test *why* a circuit behaves as it does.

---

## Slide 11: Academic Assessment & The Printable Lab Record
**Title:** Closing the Evaluation Loop: The Printable Lab Record
**Subtitle:** Verifiable, anti-plagiarism laboratory documentation generated in one click

**Key Sheet Components (Structured List):**
- **Student Authentication:** Name, University Seat Number (USN), Semester, Section, and Indian Standard Date stamp.
- **Circuit State Snapshot:** Vector SVG capture reflecting the student's exact last-tested circuit state, automatically formatted for crisp black-and-white printing.
- **Verification Stamp:**
  - `VERIFIED ✓` (Sage Green): Awarded only when 100% of required truth table combinations have been physically exercised.
  - `INCOMPLETE — n/N rows tested` (Amber): Immediately flags partial or rushed completion.
- **Viva Voce Scorecard:** Tabulates Question number, chosen answer, correctness flag (`✓`/`✗`), and final score.
- **Faculty Signature Block:** Official endorsement field for immediate grading.
- **Print Optimization:** Formatted with CSS `@page { size: A4; margin: 12mm; }` to guarantee a perfect single-page PDF output without overflowing.

---

## Slide 12: Verification, Impact & Live Demonstration
**Title:** Technical Verification, Impact, and Live Demonstration
**Subtitle:** Tested, deployed, and ready for immediate engineering classroom adoption

**Automated Test Suite (`dev/selftest.html`):**
- **100% Passing Assertion Suite:** Exhaustive verification of all 128 multiplexer combinations, truth tables for experiments 1–4, and state transitions for the ripple counter.
- **Zero Console Errors:** Clean, standards-compliant JavaScript ES modules.

**Impact Summary:**
- **Zero Cost & Infinite Access:** Runs completely free on Netlify or GitHub Pages with no licensing fees for institutions.
- **Works Anywhere:** Fully functional on student laptops, tablets, and mobile devices without installation or admin privileges.

**Live Links & Exploration:**
- **Live Simulator:** [https://apexlogicde.netlify.app/](https://apexlogicde.netlify.app/)
- **Source Code:** [https://github.com/Nilayansh/apexlogic](https://github.com/Nilayansh/apexlogic)
- **Automated Selftest:** [https://apexlogicde.netlify.app/dev/selftest.html](https://apexlogicde.netlify.app/dev/selftest.html)

*Thank you. We invite questions, live testing, and evaluator feedback.*

### END OF GAMMA PROMPT
