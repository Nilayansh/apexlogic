// ApexLogic - exp03.js
// Experiment 03: 4-to-1 Multiplexer

import { evaluateNetlist } from '../engine.js';

const muxCircuit = {
  inputs: [
    { id: 'D0', row: 0 },
    { id: 'D1', row: 1 },
    { id: 'D2', row: 2 },
    { id: 'D3', row: 3 },
    { id: 'S1', row: 4 },
    { id: 'S0', row: 5 },
    { id: 'EN', row: 6 }
  ],
  components: [
    {
      id: 'U1',
      type: 'BLOCK',
      shape: 'trapezoid',
      label: '4:1 MUX',
      col: 1,
      row: 3,
      in: ['D0', 'D1', 'D2', 'D3', 'S1', 'S0', 'EN'],
      inLabels: ['D0', 'D1', 'D2', 'D3', 'S1', 'S0', 'Ē'],
      outs: ['Y'],
      outLabels: ['Y'],
      fn: (ins) => {
        const [d0, d1, d2, d3, s1, s0, en] = ins;
        const d = [d0, d1, d2, d3];
        return { Y: en === 0 ? d[s1 * 2 + s0] : 0 };
      }
    }
  ],
  outputs: [
    { id: 'Y', net: 'Y', row: 3 }
  ]
};

const muxTable = {
  inHeaders: ['Ē', 'S1', 'S0'],
  outHeaders: ['Y'],
  rows: [
    { ins: ['0', '0', '0'], outs: ['D0'] },
    { ins: ['0', '0', '1'], outs: ['D1'] },
    { ins: ['0', '1', '0'], outs: ['D2'] },
    { ins: ['0', '1', '1'], outs: ['D3'] },
    { ins: ['1', '0', '0'], outs: ['0'] },
    { ins: ['1', '0', '1'], outs: ['0'] },
    { ins: ['1', '1', '0'], outs: ['0'] },
    { ins: ['1', '1', '1'], outs: ['0'] }
  ]
};

export const exp03 = {
  id: '03',
  title: '4-to-1 Multiplexer',
  category: 'Data Routing',
  aim: 'To implement a 4-to-1 multiplexer and observe how the select lines route one of four data inputs to the output.',
  manual: {
    theory: [
      'A multiplexer selects one of several data inputs and forwards it to a single output.',
      'A 4:1 mux needs 2 select lines because 2² = 4.',
      'The enable input is active-low: when Ē = 1 the output is forced to 0.',
      'Y = Ē′·(S₁′S₀′D₀ + S₁′S₀D₁ + S₁S₀′D₂ + S₁S₀D₃) where Ē′ means \'enabled\'.',
      'Any n-variable function can be implemented with a 2ⁿ:1 mux by tying data inputs to 0/1.'
    ],
    equationsHtml: [
      'Y = <span class="ov">E</span>·(<span class="ov">S₁</span><span class="ov">S₀</span>D₀ + <span class="ov">S₁</span>S₀D₁ + S₁<span class="ov">S₀</span>D₂ + S₁S₀D₃)'
    ],
    ics: ['74153 — Dual 4-line to 1-line data selector'],
    procedure: [
      'Set D0–D3 to different values (e.g. 0, 1, 0, 1).',
      'Keep Ē = 0 and step S1 S0 through 00, 01, 10, 11.',
      'Observe which data wire turns dark and that Y equals the selected input.',
      'Set Ē = 1 and confirm Y = 0 for all select values.',
      'Complete all 8 rows, then open the Lab Record.'
    ]
  },
  modes: [
    {
      id: 'default',
      label: '4:1 MUX',
      equationHtml: 'Y = <span class="ov">E</span>·(<span class="ov">S₁</span><span class="ov">S₀</span>D₀ + <span class="ov">S₁</span>S₀D₁ + S₁<span class="ov">S₀</span>D₂ + S₁S₀D₃)',
      inputs: [
        { id: 'D0', label: 'D0', default: 0, group: 'data' },
        { id: 'D1', label: 'D1', default: 1, group: 'data' },
        { id: 'D2', label: 'D2', default: 0, group: 'data' },
        { id: 'D3', label: 'D3', default: 1, group: 'data' },
        { id: 'S1', label: 'S1', default: 0, group: 'select' },
        { id: 'S0', label: 'S0', default: 0, group: 'select' },
        { id: 'EN', label: 'Ē', default: 0, group: 'enable' }
      ],
      outputs: [
        { id: 'Y', label: 'Y', net: 'Y' }
      ],
      circuit: muxCircuit,
      table: muxTable,
      compute: (inputs) => {
        const nets = evaluateNetlist(muxCircuit, inputs);
        const sel = (inputs.S1 || 0) * 2 + (inputs.S0 || 0);
        const isEn = inputs.EN === 0;
        const allData = ['D0', 'D1', 'D2', 'D3'];
        const dim = !isEn ? allData : allData.filter((_, idx) => idx !== sel);
        return {
          nets,
          extra: {
            selected: sel,
            enabled: isEn,
            dim
          }
        };
      },
      rowKey: (inputs) => (inputs.EN || 0) * 4 + (inputs.S1 || 0) * 2 + (inputs.S0 || 0)
    }
  ],
  viva: [
    {
      id: 'q1',
      question: 'How many select lines does an 8:1 multiplexer need?',
      options: ['2', '3', '4', '8'],
      correctIndex: 1,
      explanation: 'log₂ 8 = 3 select lines.'
    },
    {
      id: 'q2',
      question: 'In a 4:1 mux, S1 S0 = 10 selects which input?',
      options: ['D0', 'D1', 'D2', 'D3'],
      correctIndex: 2,
      explanation: 'Binary 10 = decimal 2, so D2 is routed to the output.'
    },
    {
      id: 'q3',
      question: 'With an active-low enable, the output is forced to 0 when:',
      options: ['Ē = 0', 'Ē = 1', 'S1 = 1', 'S0 = 1'],
      correctIndex: 1,
      explanation: 'Active-low means the device is enabled at 0 and disabled at 1.'
    }
  ]
};
