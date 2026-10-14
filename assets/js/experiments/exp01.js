// ApexLogic - exp01.js
// Experiment 01: Universal Gate Realization (NAND-only)

import { evaluateNetlist } from '../engine.js';

const notCircuit = {
  inputs: [{ id: 'A', row: 0.5 }],
  components: [
    { id: 'G1', type: 'NAND', col: 1, row: 0.5, in: ['A', 'A'], out: 'Y' }
  ],
  outputs: [{ id: 'Y', net: 'Y', row: 0.5 }]
};

const andCircuit = {
  inputs: [{ id: 'A', row: 0 }, { id: 'B', row: 1 }],
  components: [
    { id: 'G1', type: 'NAND', col: 1, row: 0.5, in: ['A', 'B'], out: 'X1', badge: 'X₁ = ¬(A·B)' },
    { id: 'G2', type: 'NAND', col: 2, row: 0.5, in: ['X1', 'X1'], out: 'Y' }
  ],
  outputs: [{ id: 'Y', net: 'Y', row: 0.5 }]
};

const orCircuit = {
  inputs: [{ id: 'A', row: 0 }, { id: 'B', row: 1 }],
  components: [
    { id: 'G1', type: 'NAND', col: 1, row: 0, in: ['A', 'A'], out: 'X1', badge: 'X₁ = ¬A' },
    { id: 'G2', type: 'NAND', col: 1, row: 1, in: ['B', 'B'], out: 'X2', badge: 'X₂ = ¬B' },
    { id: 'G3', type: 'NAND', col: 2, row: 0.5, in: ['X1', 'X2'], out: 'Y' }
  ],
  outputs: [{ id: 'Y', net: 'Y', row: 0.5 }]
};

const xorCircuit = {
  inputs: [{ id: 'A', row: 0 }, { id: 'B', row: 2 }],
  components: [
    { id: 'G1', type: 'NAND', col: 1, row: 1, in: ['A', 'B'], out: 'X1', badge: 'X₁ = ¬(A·B)' },
    { id: 'G2', type: 'NAND', col: 2, row: 0, in: ['A', 'X1'], out: 'X2', badge: 'X₂ = ¬(A·X₁)' },
    { id: 'G3', type: 'NAND', col: 2, row: 2, in: ['B', 'X1'], out: 'X3', badge: 'X₃ = ¬(B·X₁)' },
    { id: 'G4', type: 'NAND', col: 3, row: 1, in: ['X2', 'X3'], out: 'Y' }
  ],
  outputs: [{ id: 'Y', net: 'Y', row: 1 }]
};

export const exp01 = {
  id: '01',
  title: 'Universal Gate Realization',
  category: 'Universal Logic',
  aim: 'To realise the NOT, AND, OR and XOR gates using only 2-input NAND gates and verify their truth tables.',
  manual: {
    theory: [
      'A gate is universal if every Boolean function can be built using only that gate. NAND and NOR are universal.',
      'NAND with both inputs tied together acts as an inverter: ¬(A·A) = ¬A.',
      'AND = NAND followed by a NAND-inverter (2 gates).',
      'OR follows from De Morgan\'s law: A + B = ¬(¬A · ¬B) (3 gates).',
      'XOR needs 4 NAND gates: X₁ = ¬(A·B), X₂ = ¬(A·X₁), X₃ = ¬(B·X₁), Y = ¬(X₂·X₃).'
    ],
    equationsHtml: [
      'NOT: Y = <span class="ov">A·A</span> = <span class="ov">A</span>',
      'AND: Y = <span class="ov"><span class="ov">A·B</span></span> = A·B',
      'OR: Y = <span class="ov"><span class="ov">A</span>·<span class="ov">B</span></span> = A + B',
      'XOR: Y = A ⊕ B = <span class="ov">(<span class="ov">A·X₁</span>)·(<span class="ov">B·X₁</span>)</span>, X₁ = <span class="ov">A·B</span>'
    ],
    ics: ['7400 — Quad 2-input NAND'],
    procedure: [
      'Select a sub-mode (NOT, AND, OR or XOR).',
      'Toggle the input switches through every combination.',
      'Use the Probe to read intermediate nodes X₁, X₂, X₃.',
      'Confirm the NAND network column matches the native gate column in every row.',
      'Repeat for all four sub-modes, then open the Lab Record.'
    ]
  },
  modes: [
    {
      id: 'not',
      label: 'NOT',
      equationHtml: 'Y = <span class="ov">A·A</span> = <span class="ov">A</span>',
      inputs: [{ id: 'A', label: 'A', default: 0 }],
      outputs: [{ id: 'Y', label: 'Y', net: 'Y' }],
      circuit: notCircuit,
      compute: (inputs) => ({ nets: evaluateNetlist(notCircuit, inputs), extra: {} }),
      reference: (inputs) => ({ Y: inputs.A ? 0 : 1 }),
      rowKey: (inputs) => inputs.A,
      gateCount: 1
    },
    {
      id: 'and',
      label: 'AND',
      equationHtml: 'Y = <span class="ov"><span class="ov">A·B</span></span> = A·B',
      inputs: [{ id: 'A', label: 'A', default: 0 }, { id: 'B', label: 'B', default: 0 }],
      outputs: [{ id: 'Y', label: 'Y', net: 'Y' }],
      circuit: andCircuit,
      compute: (inputs) => ({ nets: evaluateNetlist(andCircuit, inputs), extra: {} }),
      reference: (inputs) => ({ Y: inputs.A & inputs.B }),
      rowKey: (inputs) => (inputs.A << 1) | inputs.B,
      gateCount: 2
    },
    {
      id: 'or',
      label: 'OR',
      equationHtml: 'Y = <span class="ov"><span class="ov">A</span>·<span class="ov">B</span></span> = A + B',
      inputs: [{ id: 'A', label: 'A', default: 0 }, { id: 'B', label: 'B', default: 0 }],
      outputs: [{ id: 'Y', label: 'Y', net: 'Y' }],
      circuit: orCircuit,
      compute: (inputs) => ({ nets: evaluateNetlist(orCircuit, inputs), extra: {} }),
      reference: (inputs) => ({ Y: inputs.A | inputs.B }),
      rowKey: (inputs) => (inputs.A << 1) | inputs.B,
      gateCount: 3
    },
    {
      id: 'xor',
      label: 'XOR',
      equationHtml: 'Y = A ⊕ B = <span class="ov">(<span class="ov">A·X₁</span>)·(<span class="ov">B·X₁</span>)</span>, X₁ = <span class="ov">A·B</span>',
      inputs: [{ id: 'A', label: 'A', default: 0 }, { id: 'B', label: 'B', default: 0 }],
      outputs: [{ id: 'Y', label: 'Y', net: 'Y' }],
      circuit: xorCircuit,
      compute: (inputs) => ({ nets: evaluateNetlist(xorCircuit, inputs), extra: {} }),
      reference: (inputs) => ({ Y: inputs.A ^ inputs.B }),
      rowKey: (inputs) => (inputs.A << 1) | inputs.B,
      gateCount: 4
    }
  ],
  viva: [
    {
      id: 'q1',
      question: 'Why is the NAND gate called a universal gate?',
      options: [
        'It is the fastest logic gate',
        'Any Boolean function can be built using only NAND gates',
        'It consumes no power',
        'It has only one input'
      ],
      correctIndex: 1,
      explanation: 'NAND alone can produce NOT, AND and OR, so every combinational function can be built from it.'
    },
    {
      id: 'q2',
      question: 'A 2-input NAND gate with both inputs connected to A produces:',
      options: ['A', 'Ā', '0', '1'],
      correctIndex: 1,
      explanation: '¬(A·A) = ¬A, so it behaves as an inverter.'
    },
    {
      id: 'q3',
      question: 'Minimum number of 2-input NAND gates needed to build an XOR gate:',
      options: ['2', '3', '4', '5'],
      correctIndex: 2,
      explanation: 'The standard construction uses 4 NAND gates (X₁, X₂, X₃ and the output gate).'
    }
  ]
};
