# IDT Project — First Review Write-Up (Easy Guide)

**Project Name:** ApexLogic (Virtual Digital Electronics Lab)  
**Live Website Link:** [https://apexlogicde.netlify.app/](https://apexlogicde.netlify.app/)  
**GitHub Link:** [https://github.com/Nilayansh/apexlogic](https://github.com/Nilayansh/apexlogic)  

---

## What is this project in simple words?
ApexLogic is a clean, simple website where students can practice their **Digital Electronics lab experiments online** without needing real hardware, breadboards, or physical IC chips. 

It lets you flip switches on the screen, see wires turn blue (ON) or gray (OFF), watch lamps light up, and automatically checks if your truth table is correct.

---

## 1. Problem Identification (The Problem We Chose & Why It Needs Solving)

### What is the problem?
In our 1st and 2nd year engineering labs (CSE, ISE, ECE), we have a subject called **Digital Electronics**. In the physical lab, we have to build circuits on breadboards using small chips (called ICs) and connecting wires.

In real life, this causes a lot of headaches:
1. **Broken and Burned Chips:** The pins on the IC chips are very thin and easily bend or break when students push them into breadboards. If someone connects a wire wrong (+5V to Ground), the chip burns out.
2. **Wasted Lab Time:** Students spend almost the entire 2 to 3 hour lab class just finding loose wires or trying to figure out which chip is burned, instead of actually learning how the logic works.
3. **Hidden Inside (Black Box):** Real IC chips are covered in black plastic. You cannot see what is happening inside between the gates. If your circuit doesn't work, you don't know which wire went wrong.
4. **No Equipment at Home:** Once students leave the college lab, they cannot practice before exams because oscilloscopes and IC trainer kits cost thousands of rupees.
5. **Copied Lab Records:** Because circuits take too long to wire, students often just copy the truth table numbers from each other without really testing them.

### Why does this need to be solved?
Digital electronics is the foundation of how computers and CPUs work. If students just struggle with loose wires instead of understanding logic, they struggle in later semesters with Computer Architecture and microprocessors. A virtual lab removes the hardware struggle and lets students focus on learning.

---

## 2. Proposed Solution (Our Idea & How It Solves the Problem)

### Our Idea: ApexLogic
We built **ApexLogic** — a fast, free, and beautiful web-based virtual lab that runs directly in any web browser (on laptops, phones, or tablets).

### How it solves the problem:
- **No hardware damage:** It's software. Nothing can burn, break, or get loose. Students can experiment freely without fear of damaging college lab equipment.
- **See the logic flow:** Active wires turn bright **Cobalt Blue** (when signal is 1 / HIGH) and stay **Gray** (when signal is 0 / LOW). You can clearly see where electricity is flowing.
- **Interactive Logic Probe:** We added a tool called the **Probe**. You can click on *any* wire or pin in the circuit to see its exact name, voltage (+5V or 0V), and if it's 1 or 0.
- **Built-in Waveform Viewer:** Instead of needing an expensive physical oscilloscope, our counter experiment has a live digital graph right on screen showing the clock and how the frequency divides ($f/2, f/4, f/8$).
- **Verified Truth Tables:** As you flip switches, the truth table marks your visited rows with a checkmark ($\checkmark$). When you finish all rows, it marks you as **Verified**.
- **1-Click Printable Lab Record:** With one click, it generates an authentic single-page A4 record sheet with your Name, USN, circuit diagram, truth table, and a teacher signature line.

---

## 3. Frontend Development (User Interface & Navigation)

Our website is designed to be **super clean, minimal, and easy to use** (inspired by modern minimalist Swiss design):

### The Main Screens & Navigation:
1. **Home Screen (`index.html`):**
   - Shows all 5 experiments in clean, modern rows.
   - Shows your progress on each experiment (e.g., `Rows 4/4 · Viva 3/3`).
   - Clicking any experiment opens it immediately.
2. **Experiment Screen (`experiment.html`):**
   - **Header bar:** Has our logo, a dropdown to switch between experiments, a student pill button (to enter your Name and USN), and a button for your **Lab Record**.
   - **3 Simple Tabs:**
     - **Simulate Tab:** The main screen. On the left is the circuit with interactive switches and output lamps. On the right is the live truth table and circuit status.
     - **Manual Tab:** Contains the textbook lab manual (Aim, Theory, Boolean Formulas, and Step-by-Step Procedure).
     - **Viva Tab:** Contains 3 quiz questions per experiment with explanations so students can test their knowledge.
3. **Printable Lab Record Screen (`record.html`):**
   - A clean white sheet formatted to fit exactly on **one A4 page**.
   - Automatically fills in the student's name, USN, date, circuit diagram snapshot, tested truth table, and faculty signature line.

---

## 4. Project Implementation (What We Built)

The instruction asked for **at least 50% implementation**, but **we have completed 100% of the project**. All 5 standard digital electronics experiments are fully functional and working:

### Experiment 1: Universal Gate Realization (NAND Gates)
- **What it does:** Proves that you can build any gate (**NOT, AND, OR, XOR**) using only NAND gates (IC 7400).
- **How it works:** You can choose NOT, AND, OR, or XOR from the top buttons. Flip the input switches, and you will see how intermediate wires ($X_1, X_2, X_3$) compute the result. A special column in the table proves that your NAND circuit gives the exact same output as a real gate.

### Experiment 2: Half Adder & Full Adder
- **What it does:** Demonstrates binary addition.
- **Half Adder:** Adds 2 bits ($A + B$) and gives **Sum** and **Carry**.
- **Full Adder:** Adds 3 bits ($A + B + C_{\text{in}}$) so you can carry over numbers.
- **Cool feature:** It has a live math line at the bottom showing normal math, like `1 + 1 + 1 = 3 → Sum = 1, Carry = 1`.

### Experiment 3: 4-to-1 Multiplexer (Data Selector)
- **What it does:** Takes 4 data inputs ($D_0, D_1, D_2, D_3$) and uses 2 select switches ($S_1, S_0$) to choose which one gets forwarded to the output lamp.
- **Cool feature:** The selected wire stays bright blue while the unselected wires automatically fade out. If you turn on the Enable switch ($\bar{E} = 1$), the output is forced to $0$ (disabled).

### Experiment 4: BCD to 7-Segment Decoder
- **What it does:** Takes 4 binary bits ($0000$ to $1001$) and lights up the correct segments on a digital 7-segment display (like an elevator or digital clock) to show numbers $0$ through $9$.
- **Cool feature:** It has a `[−]` and `[+]` button so you can just click to change numbers, and the switches move automatically! If you put an invalid number ($10$ to $15$), it shows a dash and a red warning badge.

### Experiment 5: 3-bit Ripple Counter
- **What it does:** A digital counter that counts up in binary from $0$ to $7$ ($000 \to 111$) and then resets back to $0$.
- **Cool feature:** You can click **Step Clock** to count one by one, or turn on **Auto Run** to let it count automatically. A built-in waveform strip draws the digital clock waves on screen in real time.

---

## 5. What Technologies We Used & Why We Kept It Simple

We built this whole project using **Vanilla Web Technologies (Pure HTML5, CSS3, and JavaScript ES Modules)** with **zero external libraries or npm packages**.

### Why did we choose this instead of React or Flutter?
1. **Super Fast (Under 100ms):** There are no heavy 10 MB framework files to download. It opens instantly, even on slow college Wi-Fi or old computer lab PCs.
2. **Never Breaks:** React packages and npm libraries often break when updated. Plain HTML/CSS/JavaScript will work today, tomorrow, and 10 years from now.
3. **100% Client-Side:** Everything runs right inside the user's browser. We don't need expensive backend servers or databases. Student USN and test progress save safely in the browser's `localStorage`.
4. **Sharp Vector Diagrams:** All circuits are drawn using native **SVG (Scalable Vector Graphics)**, so you can zoom in as much as you want on phones or 4K monitors and the circuits stay completely sharp.

---

## 6. How Anyone in Our Group Can Explain It to the Teacher

If the teacher asks you questions individually, keep your answers short, confident, and simple:

- **If asked: "What is your project?"**  
  *"Our project is ApexLogic. It is an interactive virtual lab for Digital Electronics that lets students simulate circuits, probe voltages, test truth tables, and print lab records directly in their browser."*

- **If asked: "What problem are you solving?"**  
  *"In physical labs, chips frequently burn out, wires get loose, and students can't see what's happening inside IC chips. Our platform gives instant visual feedback, lets students test internal nodes with a virtual probe, and allows them to practice from home for free."*

- **If asked: "How much of the project is done?"**  
  *"Although the review required 50%, we have completed 100% of the project. All 5 core experiments (NAND universality, Adders, Multiplexer, 7-Segment decoder, and Ripple counter) are fully built, tested, and live on the internet."*

- **If asked: "Is this just an animation or real logic?"**  
  *"It is real logic! We wrote our own simulation engine in JavaScript. When you toggle a switch, the code calculates the true Boolean equations step by step and updates the wires and lamps in real time."*

- **If asked: "Where is it hosted and what technologies did you use?"**  
  *"It is hosted live on Netlify at `apexlogicde.netlify.app`. We built it using pure HTML, CSS, and modern JavaScript modules with zero heavy dependencies so that it loads instantly on any phone or PC."*
