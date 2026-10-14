# ApexLogic — Digital Electronics Virtual Lab

[![Live Demo](https://img.shields.io/badge/Live%20Demo-apexlogicde.netlify.app-1D4ED8?style=flat&logo=netlify)](https://apexlogicde.netlify.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Nilayansh%2Fapexlogic-09090B?style=flat&logo=github)](https://github.com/Nilayansh/apexlogic)
[![Tests](https://img.shields.io/badge/Tests-All%20Passing-15803D?style=flat)](https://apexlogicde.netlify.app/dev/selftest.html)

**Live Website**: [https://apexlogicde.netlify.app/](https://apexlogicde.netlify.app/)

ApexLogic is a minimalist, browser-only virtual laboratory engineered for 1st/2nd-year CSE, ISE, and ECE Digital Electronics. It delivers interactive circuit simulation, deterministic orthogonal SVG schematics, live truth table verification, floating voltage logic probing, integrated Viva Voce quizzes, and one-page printable Lab Records. Built with 100% zero dependencies, vanilla HTML5, CSS3, and modern ES modules.

---

## 🧪 Experiments Included

1. **Universal Gate Realization (NAND-Only)** — Realization of NOT, AND, OR, and XOR gates using only IC 7400 Quad NAND gates with real-time native gate verification.
2. **Half & Full Adder** — Binary addition circuits with active Sum and Carry paths and real-time decimal summation.
3. **4-to-1 Multiplexer (Data Routing)** — Data routing with select lines, active-low enable ($\bar{E}$), and dynamic signal path highlighting.
4. **BCD to 7-Segment Decoder** — Interactive decimal stepper and 7-segment display driver with invalid BCD code detection.
5. **3-bit Asynchronous Ripple Counter** — Cascaded T flip-flop sequential counter with manual step, auto-run clock, and multi-lane SVG logic analyzer strip ($f/2, f/4, f/8$).

---

## 🚀 Local Development

JavaScript ES modules require an HTTP server (direct `file://` opening is blocked by CORS in modern browsers):

```bash
# Serve locally via npx or python
npx serve .
# or: python3 -m http.server 3000
```

Open `http://localhost:3000` in your browser.  
Run automated verification suite at `http://localhost:3000/dev/selftest.html`.

---

## 📦 Deployment

* **Live URL**: [https://apexlogicde.netlify.app/](https://apexlogicde.netlify.app/)
* **Continuous Deployment**: Linked directly to the `main` branch of this repository on Netlify (zero build commands, root directory publish).
