// ApexLogic - exp05.js
// Experiment 05: 3-bit Asynchronous Ripple Counter

export function tick(rt) {
  const q = [...rt.q];
  // rising edge on CLK -> FF0 toggles
  let i = 0;
  q[0] ^= 1;
  // ripple: FF(n+1) is clocked by Q̄n; Q̄n rises exactly when Qn falls (1 -> 0)
  while (i < 2 && q[i] === 0) {
    q[i + 1] ^= 1;
    i++;
  }
  return { q, clk: 0 };
}

const counterCircuit = {
  inputs: [
    { id: 'CLK', row: 0.5 }
  ],
  components: [
    {
      id: 'FF0',
      type: 'BLOCK',
      shape: 'rect',
      label: 'T-FF 0',
      col: 1,
      row: 0.5,
      in: ['CLK'],
      inLabels: ['CLK'],
      outs: ['Q0', 'Q0b'],
      outLabels: ['Q', 'Q̄'],
      led: 'Q0'
    },
    {
      id: 'FF1',
      type: 'BLOCK',
      shape: 'rect',
      label: 'T-FF 1',
      col: 2,
      row: 0.5,
      in: ['Q0b'],
      inLabels: ['CLK'],
      outs: ['Q1', 'Q1b'],
      outLabels: ['Q', 'Q̄'],
      led: 'Q1'
    },
    {
      id: 'FF2',
      type: 'BLOCK',
      shape: 'rect',
      label: 'T-FF 2',
      col: 3,
      row: 0.5,
      in: ['Q1b'],
      inLabels: ['CLK'],
      outs: ['Q2', 'Q2b'],
      outLabels: ['Q', 'Q̄'],
      led: 'Q2'
    }
  ],
  outputs: [] // Q pins use 16px stubs
};

const counterTable = {
  inHeaders: ['Count'],
  outHeaders: ['Q2', 'Q1', 'Q0'],
  rows: [
    { ins: ['0'], outs: ['0', '0', '0'] },
    { ins: ['1'], outs: ['0', '0', '1'] },
    { ins: ['2'], outs: ['0', '1', '0'] },
    { ins: ['3'], outs: ['0', '1', '1'] },
    { ins: ['4'], outs: ['1', '0', '0'] },
    { ins: ['5'], outs: ['1', '0', '1'] },
    { ins: ['6'], outs: ['1', '1', '0'] },
    { ins: ['7'], outs: ['1', '1', '1'] }
  ]
};

export const exp05 = {
  id: '05',
  title: '3-bit Ripple Counter',
  category: 'Sequential',
  aim: 'To observe the operation of a 3-bit asynchronous (ripple) up-counter built from cascaded T flip-flops and to verify frequency division.',
  manual: {
    theory: [
      'In an asynchronous counter the clock drives only the first flip-flop; each later stage is clocked by the previous stage\'s output, so the stages change one after another (they \'ripple\').',
      'Each T flip-flop with T = 1 toggles on every rising clock edge, dividing its input frequency by 2.',
      'Here Q̄ₙ clocks stage n+1: Q̄ₙ rises when Qₙ falls, which is the carry condition for an up-count.',
      '3 flip-flops give a MOD-8 counter (0 to 7) and frequencies f/2, f/4, f/8.',
      'Note: with negative-edge-triggered ICs (e.g. 74LS76) the next stage would be clocked from Q instead of Q̄ for the same up-count.'
    ],
    equationsHtml: [
      'Q₀ toggles every clock; Q₁ toggles when Q₀: 1→0; Q₂ toggles when Q₁: 1→0  ·  f(Q₀)=f/2, f(Q₁)=f/4, f(Q₂)=f/8'
    ],
    ics: ['Generic positive-edge T flip-flops (JK with J = K = 1)'],
    procedure: [
      'Press Clear so the count is 000.',
      'Use Step to apply clock pulses one at a time and record Q2 Q1 Q0 each time.',
      'Turn on Auto Run and change the speed.',
      'Watch the waveform strip and confirm Q0, Q1, Q2 have periods 2, 4 and 8 clock cycles.',
      'Visit all 8 states, then open the Lab Record.'
    ]
  },
  modes: [
    {
      id: 'default',
      label: '3-bit Up Counter',
      equationHtml: 'Q₀ toggles on CLK; Q₁ on Q₀: 1→0; Q₂ on Q₁: 1→0 · MOD-8',
      inputs: [],
      outputs: [
        { id: 'Q2', label: 'Q2', net: 'Q2' },
        { id: 'Q1', label: 'Q1', net: 'Q1' },
        { id: 'Q0', label: 'Q0', net: 'Q0' }
      ],
      circuit: counterCircuit,
      table: counterTable,
      compute: (inputs, runtime = {}) => {
        const q = runtime.q || [0, 0, 0];
        const clk = runtime.clk || 0;
        const [q0, q1, q2] = q;
        const nets = {
          CLK: clk,
          Q0: q0,
          Q0b: 1 - q0,
          Q1: q1,
          Q1b: 1 - q1,
          Q2: q2,
          Q2b: 1 - q2
        };
        const dec = q2 * 4 + q1 * 2 + q0;
        return {
          nets,
          extra: {
            q,
            dec
          }
        };
      },
      rowKey: (inputs, runtime = {}) => {
        const q = runtime.q || [0, 0, 0];
        return (q[2] || 0) * 4 + (q[1] || 0) * 2 + (q[0] || 0);
      }
    }
  ],
  viva: [
    {
      id: 'q1',
      question: 'Why is a ripple counter called asynchronous?',
      options: [
        'It has no flip-flops',
        'The flip-flops do not share a common clock',
        'It counts only even numbers',
        'It needs no power supply'
      ],
      correctIndex: 1,
      explanation: 'Only the first stage gets the external clock; each later stage is clocked by the previous one.'
    },
    {
      id: 'q2',
      question: 'What is the modulus of a 3-bit binary counter?',
      options: ['3', '6', '8', '16'],
      correctIndex: 2,
      explanation: '2³ = 8 states (0 to 7).'
    },
    {
      id: 'q3',
      question: 'What is the propagation-delay penalty of a ripple counter?',
      options: [
        'None, all stages switch together',
        'Delays add up stage by stage, limiting the maximum clock frequency',
        'It halves the supply voltage',
        'It only affects the first flip-flop'
      ],
      correctIndex: 1,
      explanation: 'Total delay ≈ n × t_pd, so the output settles late and fast clocking can cause wrong intermediate counts.'
    }
  ]
};
