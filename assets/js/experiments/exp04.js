// ApexLogic - exp04.js
// Experiment 04: BCD to 7-Segment Decoder

import { evaluateNetlist } from '../engine.js';

export const SEG = {
  0: [1, 1, 1, 1, 1, 1, 0],
  1: [0, 1, 1, 0, 0, 0, 0],
  2: [1, 1, 0, 1, 1, 0, 1],
  3: [1, 1, 1, 1, 0, 0, 1],
  4: [0, 1, 1, 0, 0, 1, 1],
  5: [1, 0, 1, 1, 0, 1, 1],
  6: [1, 0, 1, 1, 1, 1, 1],
  7: [1, 1, 1, 0, 0, 0, 0],
  8: [1, 1, 1, 1, 1, 1, 1],
  9: [1, 1, 1, 1, 0, 1, 1],
};

export const DASH = [0, 0, 0, 0, 0, 0, 1];

const bcdCircuit = {
  inputs: [
    { id: 'B3', row: 0 },
    { id: 'B2', row: 1 },
    { id: 'B1', row: 2 },
    { id: 'B0', row: 3 }
  ],
  components: [
    {
      id: 'U1',
      type: 'BLOCK',
      shape: 'rect',
      label: '7447',
      col: 1,
      row: 1.5,
      in: ['B3', 'B2', 'B1', 'B0'],
      inLabels: ['B3', 'B2', 'B1', 'B0'],
      outs: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      outLabels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      fn: (ins) => {
        const [b3, b2, b1, b0] = ins;
        const v = b3 * 8 + b2 * 4 + b1 * 2 + b0;
        const s = SEG[v] ?? DASH;
        return {
          a: s[0],
          b: s[1],
          c: s[2],
          d: s[3],
          e: s[4],
          f: s[5],
          g: s[6]
        };
      }
    },
    {
      id: 'D1',
      type: 'SEG7',
      col: 2,
      row: 1.5,
      in: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    }
  ],
  outputs: [] // No discrete output terminal pins; the display is the output
};

// Generate 16-row truth table
function buildBcdTable() {
  const inHeaders = ['B3', 'B2', 'B1', 'B0', 'Dec'];
  const outHeaders = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const rows = [];

  for (let v = 0; v < 16; v++) {
    const b3 = (v >> 3) & 1;
    const b2 = (v >> 2) & 1;
    const b1 = (v >> 1) & 1;
    const b0 = v & 1;

    const ins = [String(b3), String(b2), String(b1), String(b0), String(v)];
    let outs;
    if (v <= 9) {
      outs = SEG[v].map(String);
    } else {
      outs = ['—', '—', '—', '—', '—', '—', '—'];
    }
    rows.push({ ins, outs });
  }

  return { inHeaders, outHeaders, rows, validRowCount: 10 };
}

export const exp04 = {
  id: '04',
  title: 'BCD to 7-Segment Decoder',
  category: 'Combinational',
  aim: 'To decode a 4-bit BCD input and display the corresponding decimal digit on a 7-segment display.',
  manual: {
    theory: [
      'BCD encodes each decimal digit 0–9 in 4 bits; codes 1010–1111 are invalid.',
      'A 7-segment display has segments a–g; lighting the right combination forms each digit.',
      'A decoder IC such as the 7447 converts the BCD input to the seven segment drive signals.',
      'Digit 1 lights only b and c; digit 8 lights all seven.',
      'Invalid codes are shown as a dash in this simulator.'
    ],
    equationsHtml: [
      'a, b, c, d, e, f, g = f(B₃B₂B₁B₀)  ·  valid for 0000₂ – 1001₂'
    ],
    ics: [
      '7447 — BCD to 7-segment decoder/driver',
      'Common-anode 7-segment display'
    ],
    procedure: [
      'Use the stepper to walk through 0–9 and note the lit segments.',
      'Now set the bit switches manually.',
      'Set 1010₂ – 1111₂ and observe the invalid-input badge.',
      'Use the Probe to read the segment lines a–g.',
      'Visit all ten valid rows, then open the Lab Record.'
    ]
  },
  modes: [
    {
      id: 'default',
      label: '7447 Decoder',
      equationHtml: 'a, b, c, d, e, f, g = f(B₃B₂B₁B₀)  ·  valid for 0000₂ – 1001₂',
      inputs: [
        { id: 'B3', label: 'B3', default: 0 },
        { id: 'B2', label: 'B2', default: 0 },
        { id: 'B1', label: 'B1', default: 0 },
        { id: 'B0', label: 'B0', default: 0 }
      ],
      outputs: [],
      circuit: bcdCircuit,
      table: buildBcdTable(),
      compute: (inputs) => {
        const nets = evaluateNetlist(bcdCircuit, inputs);
        const val = (inputs.B3 || 0) * 8 + (inputs.B2 || 0) * 4 + (inputs.B1 || 0) * 2 + (inputs.B0 || 0);
        const isValid = val <= 9;
        return {
          nets,
          extra: {
            value: val,
            isValid
          }
        };
      },
      rowKey: (inputs) => (inputs.B3 || 0) * 8 + (inputs.B2 || 0) * 4 + (inputs.B1 || 0) * 2 + (inputs.B0 || 0)
    }
  ],
  viva: [
    {
      id: 'q1',
      question: 'How many bits are needed to represent one BCD digit?',
      options: ['3', '4', '5', '8'],
      correctIndex: 1,
      explanation: 'Digits 0–9 need 4 bits (0000 to 1001).'
    },
    {
      id: 'q2',
      question: 'Which segments are lit to display the digit 1?',
      options: ['a and b', 'b and c', 'c and d', 'e and f'],
      correctIndex: 1,
      explanation: 'The digit 1 uses the two right-hand vertical segments, b and c.'
    },
    {
      id: 'q3',
      question: 'The input 1010₂ in BCD is:',
      options: ['Decimal 10', 'Decimal 9', 'An invalid code', 'Decimal 5'],
      correctIndex: 2,
      explanation: 'BCD only uses 0000–1001; 1010–1111 are invalid codes.'
    }
  ]
};
