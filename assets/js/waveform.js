// ApexLogic - waveform.js
// Logic analyzer strip for sequential circuits (Experiment 05)

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_SAMPLES = 32;
const SAMPLE_WIDTH = 20;
const LANE_HEIGHT = 28;
const LABEL_WIDTH = 70;

function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

export function createWaveform(container, signalConfigs) {
  // signalConfigs: Array<{ key: string, label: string, color?: string }>
  container.className = 'waveform-container';

  let samples = [];

  const totalWidth = LABEL_WIDTH + MAX_SAMPLES * SAMPLE_WIDTH;
  const totalHeight = signalConfigs.length * LANE_HEIGHT;

  function render() {
    container.innerHTML = '';

    const svg = createSvgElement('svg', {
      viewBox: `0 0 ${totalWidth} ${totalHeight}`,
      width: '100%',
      class: 'waveform-svg',
      preserveAspectRatio: 'xMinYMid meet'
    });
    svg.style.minWidth = '460px';

    // Background & lane dividers
    signalConfigs.forEach((sig, idx) => {
      const laneY = idx * LANE_HEIGHT;

      // Divider line
      if (idx > 0) {
        const divLine = createSvgElement('line', {
          x1: 0,
          y1: laneY,
          x2: totalWidth,
          y2: laneY,
          stroke: 'var(--border)',
          'stroke-width': 1
        });
        svg.appendChild(divLine);
      }

      // Signal Label
      const txt = createSvgElement('text', {
        x: 6,
        y: laneY + 17,
        'font-family': 'var(--font-mono)',
        'font-size': '10px',
        'font-weight': '600',
        fill: sig.key === 'CLK' ? 'var(--amber)' : 'var(--ink)'
      });
      txt.textContent = sig.label;
      svg.appendChild(txt);
    });

    // Vertical grid lines
    const currentCount = samples.length;
    // Align newest sample to the right
    const startOffset = MAX_SAMPLES - currentCount;

    for (let i = 0; i <= MAX_SAMPLES; i++) {
      const gx = LABEL_WIDTH + i * SAMPLE_WIDTH;
      const vLine = createSvgElement('line', {
        x1: gx,
        y1: 0,
        x2: gx,
        y2: totalHeight,
        stroke: 'var(--border)',
        'stroke-width': 1,
        'stroke-dasharray': '2 2'
      });
      svg.appendChild(vLine);
    }

    // Draw signals
    signalConfigs.forEach((sig, sIdx) => {
      const laneY = sIdx * LANE_HEIGHT;
      const highY = laneY + 5;
      const lowY = laneY + 23;
      const strokeColor = sig.color || (sig.key === 'CLK' ? 'var(--amber)' : 'var(--sig-high)');

      if (samples.length === 0) return;

      let pathD = '';
      let prevY = null;

      samples.forEach((sample, idx) => {
        const val = sample[sig.key] ?? 0;
        const curY = val === 1 ? highY : lowY;
        const x1 = LABEL_WIDTH + (startOffset + idx) * SAMPLE_WIDTH;
        const x2 = x1 + SAMPLE_WIDTH;

        if (idx === 0) {
          pathD += `M ${x1} ${curY} H ${x2}`;
        } else {
          if (curY !== prevY) {
            pathD += ` V ${curY} H ${x2}`;
          } else {
            pathD += ` H ${x2}`;
          }
        }
        prevY = curY;
      });

      const wirePath = createSvgElement('path', {
        d: pathD,
        fill: 'none',
        stroke: strokeColor,
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      });
      svg.appendChild(wirePath);
    });

    container.appendChild(svg);
  }

  render();

  return {
    push(sampleObj) {
      samples.push({ ...sampleObj });
      if (samples.length > MAX_SAMPLES) {
        samples.shift();
      }
      render();
    },

    clear() {
      samples = [];
      render();
    }
  };
}
