# ApexLogic — Digital Electronics Virtual Lab

ApexLogic is a minimalist, browser-only virtual lab for 1st-year CSE/ISE Digital Electronics covering 5 core experiments (NAND universal gates, half/full adder, 4:1 multiplexer, BCD to 7-segment decoder, and 3-bit ripple counter) with interactive simulations, live truth tables, logic probing, viva quizzes, and printable one-page lab records. Built with zero dependencies, vanilla HTML5, CSS3, and ES modules.

## Local Development

JavaScript ES modules require an HTTP server (direct `file://` opening is blocked by CORS in modern browsers):

```bash
# Serve locally via npx or python
npx serve .
# or: python3 -m http.server 8000
```
Open `http://localhost:3000` (or `http://localhost:8000`) in your browser. Run automated tests at `/dev/selftest.html`.

## Deployment

1. **Netlify Drag & Drop**: Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the repository folder directly.
2. **Git Integration**: Push to GitHub and link to Netlify (leave build command blank; publish directory set to `.`).
