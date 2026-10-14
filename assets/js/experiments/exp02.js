// ApexLogic - exp02.js
// Experiment 02: Half Adder & Full Adder

import { evaluateNetlist } from '../engine.js';

const halfCircuit = {
  inputs: [
    { id: 'A', row: 0 },
    { id: 'B', row: 1 }
  ],
  components: [
    { id: 'G1', type: 'XOR', col: 1, row: 0, in: ['A', 'B'], out: 'Sum' },
    { id: 'G2', type: 'AND', col: 1, row: 1, in: ['A', 'B'], out: 'Carry' }
  ],
  outputs: [
    { id: 'Sum', net: 'Sum', row: 0 },
    { id: 'Carry', net: 'Carry', row: 1 }
  ]
};

const fullCircuit = {
  inputs: [
    { id: 'A', row: 0 },
    { id: 'B', row: 1 },
    { id: 'Cin', row: 3 }
  ],
  components: [
    { id: 'G1', type: 'XOR', col: 1, row: 0.5, in: ['A', 'B'], out: 'X1', badge: 'X₁ = A ⊕ B' },
    { id: 'G2', type: 'AND', col: 1, row: 2, in: ['A', 'B'], out: 'X2', badge: 'X₂ = A·B' },
    { id: 'G3', type: 'XOR', col: 2, row: 0.5, in: ['X1', 'Cin'], out: 'Sum' },
    { id: 'G4', type: 'AND', col: 2, row: 3, in: ['Cin', 'X1'], out: 'X3', badge: 'X₃ = Cin·X₁' },
    { id: 'G5', type: 'OR', col: 3, row: 2.5, in: ['X2', 'X3'], out: 'Cout' }
  ],
  outputs: [
    { id: 'Sum', net: 'Sum', row: 0.5 },
    { id: 'Cout', net: 'Cout', row: 2.5 }
  ]
};

export const exp02 = {
  id: '02',
  title: 'Half & Full Adder',
  category: 'Combinational',
  aim: 'To construct a half adder and a full adder using logic gates and verify binary addition with carry.',
  manual: {
    theory: [
      'A half adder adds two bits and produces Sum and Carry; it has no carry-in.',
      'Half adder: Sum = A ⊕ B, Carry = A·B.',
      'A full adder adds three bits (A, B, Cin) so adders can be cascaded.',
      'Full adder: Sum = A ⊕ B ⊕ Cin; Cout = A·B + Cin·(A ⊕ B).',
      'A full adder can be built from two half adders and an OR gate.'
    ],
    equationsHtml: [
      'Half Adder: Sum = A ⊕ B, Carry = A·B',
      'Full Adder: Sum = A ⊕ B ⊕ Cin, Cout = A·B + Cin·(A ⊕ B)'
    ],
    ics: [
      '7486 — Quad 2-input XOR',
      '7408 — Quad 2-input AND',
      '7432 — Quad 2-input OR'
    ],
    procedure: [
      'Choose Half Adder and set all input combinations; note Sum and Carry.',
      'Switch to Full Adder.',
      'Set A, B and Cin and check the decimal sum line against the lamps.',
      'Use the Probe on X₁, X₂ and X₃ to follow the carry path.',
      'Complete every truth-table row, then open the Lab Record.'
    ]
  },
  modes: [
    {
      id: 'half',
      label: 'Half Adder',
      equationHtml: 'Sum = A ⊕ B,  Carry = A·B',
      inputs: [
        { id: 'A', label: 'A', default: 0 },
        { id: 'B', label: 'B', default: 0 }
      ],
      outputs: [
        { id: 'Sum', label: 'Sum', net: 'Sum' },
        { id: 'Carry', label: 'Carry', net: 'Carry' }
      ],
      circuit: halfCircuit,
      compute: (inputs) => ({ nets: evaluateNetlist(halfCircuit, inputs), extra: {} }),
      reference: (inputs) => ({ Sum: inputs.A ^ inputs.B, Carry: inputs.A & inputs.B }),
      rowKey: (inputs) => (inputs.A << 1) | inputs.B,
      gateCount: 2
    },
    {
      id: 'full',
      label: 'Full Adder',
      equationHtml: 'Sum = A ⊕ B ⊕ Cin,  Cout = A·B + Cin·(A ⊕ B)',
      inputs: [
        { id: 'A', label: 'A', default: 0 },
        { id: 'B', label: 'B', default: 0 },
        { id: 'Cin', label: 'Cin', default: 0 }
      ],
      outputs: [
        { id: 'Sum', label: 'Sum', net: 'Sum' },
        { id: 'Cout', label: 'Cout', net: 'Cout' }
      ],
      circuit: fullCircuit,
      compute: (inputs) => ({ nets: evaluateNetlist(fullCircuit, inputs), extra: {} }),
      reference: (inputs) => ({
        Sum: inputs.A ^ inputs.B ^ inputs.Cin,
        Cout: (inputs.A & inputs.B) | (inputs.Cin & (inputs.A ^ inputs.B))
      }),
      rowKey: (inputs) => (inputs.A << 2) | (inputs.B << 1) | inputs.Cin,
      gateCount: 5
    }
  ],
  viva: [
    {
      id: 'q1',
      question: 'In a half adder, the Carry output equals:',
      options: ['A ⊕ B', 'A · B', 'A + B', 'Ā · B'],
      correctIndex: 1,
      explanation: 'A carry is produced only when both bits are 1, which is the AND of A and B.'
    },
    {
      id: 'q2',
      question: 'How many inputs and outputs does a full adder have?',
      options: ['2 in, 2 out', '3 in, 2 out', '3 in, 3 out', '2 in, 1 out'],
      correctIndex: 1,
      explanation: 'Inputs: A, B, Cin. Outputs: Sum and Cout.'
    },
    {
      id: 'q3',
      question: 'For A = 1, B = 1, Cin = 1 the full adder gives:',
      options: [
        'Sum = 0, Cout = 1',
        'Sum = 1, Cout = 0',
        'Sum = 1, Cout = 1',
        'Sum = 0, Cout = 0'
      ],
      correctIndex: 2,
      explanation: '1 + 1 + 1 = 3 = 11₂, so Sum = 1 and Cout = 1.'
    }
  ]
};
