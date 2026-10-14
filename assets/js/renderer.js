// ApexLogic - renderer.js
// SVG Circuit Schematic Renderer using document.createElementNS

const SVG_NS = 'http://www.w3.org/2000/svg';

const COL_W = 180;
const ROW_H = 90;
const X0 = 60;
const Y0 = 40;

const x = col => X0 + col * COL_W;
const y = row => Y0 + row * ROW_H;

const GATE_PATHS = {
  AND: 'M0 0 H32 A24 24 0 0 1 32 48 H0 Z',
  OR: 'M0 0 H18 C38 0 52 12 56 24 C52 36 38 48 18 48 H0 C10 36 10 12 0 0 Z',
  XOR_EXTRA: 'M-7 0 C3 12 3 36 -7 48',
  NOT: 'M0 0 L48 24 L0 48 Z',
};

function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

export function createCircuitView(svgParent, circuit) {
  svgParent.innerHTML = '';

  // Determine bounds
  let maxCol = 1;
  let maxRow = 1;

  if (circuit.inputs) {
    for (const inp of circuit.inputs) {
      if (inp.row > maxRow) maxRow = inp.row;
    }
  }

  if (circuit.components) {
    for (const comp of circuit.components) {
      if (comp.col > maxCol) maxCol = comp.col;
      if (comp.row > maxRow) maxRow = comp.row;
    }
  }

  if (circuit.outputs) {
    for (const out of circuit.outputs) {
      if (out.row > maxRow) maxRow = out.row;
    }
  }

  const svgW = x(maxCol + 1) + 80;
  const svgH = y(maxRow) + 80;

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${svgW} ${svgH}`,
    width: '100%',
    role: 'img',
    'aria-label': 'Circuit schematic diagram',
    preserveAspectRatio: 'xMinYMid meet',
  });
  svg.style.minWidth = `${Math.round(svgW * 0.7)}px`;

  // Map drivers: netName -> { sx, sy }
  const drivers = new Map();
  // Map sinks: netName -> Array<{ dx, dy, col }>
  const sinks = new Map();
  // Track fanouts: netName -> count
  const fanout = new Map();

  // Register inputs as drivers
  if (circuit.inputs) {
    for (const inp of circuit.inputs) {
      const sx = X0;
      const sy = y(inp.row);
      drivers.set(inp.id, { sx, sy });
    }
  }

  // Find component drivers and sinks
  const componentInfo = [];

  if (circuit.components) {
    for (const comp of circuit.components) {
      const cx = x(comp.col);
      const cy = y(comp.row);

      if (comp.type === 'BLOCK') {
        const isMux = comp.shape === 'trapezoid';
        const w = isMux ? 90 : 80;
        const numIns = (comp.in || []).length;
        const numOuts = (comp.outs || []).length;
        const h = Math.max(Math.max(numIns, numOuts) * 20 + 20, 60);
        const bx = cx;
        const by = cy - h / 2;

        const inPins = (comp.in || []).map((net, i) => {
          const pinY = by + (h - (numIns - 1) * 20) / 2 + i * 20;
          return { net, dx: bx, dy: pinY, label: comp.inLabels ? comp.inLabels[i] : net };
        });

        const outPins = (comp.outs || []).map((net, i) => {
          const pinY = by + (h - (numOuts - 1) * 20) / 2 + i * 20;
          return { net, sx: bx + w, sy: pinY, label: comp.outLabels ? comp.outLabels[i] : net };
        });

        for (const p of inPins) {
          if (!sinks.has(p.net)) sinks.set(p.net, []);
          sinks.get(p.net).push({ dx: p.dx, dy: p.dy, col: comp.col });
          fanout.set(p.net, (fanout.get(p.net) || 0) + 1);
        }

        for (const p of outPins) {
          drivers.set(p.net, { sx: p.sx, sy: p.sy });
        }

        componentInfo.push({ comp, bx, by, w, h, inPins, outPins });
      } else if (comp.type === 'SEG7') {
        const scale = 1.2;
        const h = 106 * scale;
        const bx = cx;
        const by = cy - h / 2;

        const inPins = (comp.in || []).map((net, i) => {
          const pinY = by + (8 + i * 15) * scale;
          return { net, dx: bx, dy: pinY, label: net };
        });

        for (const p of inPins) {
          if (!sinks.has(p.net)) sinks.set(p.net, []);
          sinks.get(p.net).push({ dx: p.dx, dy: p.dy, col: comp.col });
          fanout.set(p.net, (fanout.get(p.net) || 0) + 1);
        }

        componentInfo.push({ comp, bx, by, inPins, scale });
      } else {
        // Gate
        const bx = cx;
        const by = cy - 24;
        const numIns = (comp.in || []).length;
        const inPins = [];

        if (numIns === 1) {
          inPins.push({ net: comp.in[0], dx: bx, dy: cy });
        } else if (numIns === 2) {
          inPins.push({ net: comp.in[0], dx: bx, dy: cy - 12 });
          inPins.push({ net: comp.in[1], dx: bx, dy: cy + 12 });
        }

        for (const p of inPins) {
          if (!sinks.has(p.net)) sinks.set(p.net, []);
          sinks.get(p.net).push({ dx: p.dx, dy: p.dy, col: comp.col });
          fanout.set(p.net, (fanout.get(p.net) || 0) + 1);
        }

        let outX = bx + 56;
        if (comp.type === 'NAND' || comp.type === 'NOR') {
          outX = bx + 64;
        } else if (comp.type === 'NOT') {
          outX = bx + 56;
        }
        const outY = cy;
        drivers.set(comp.out, { sx: outX, sy: outY });

        componentInfo.push({ comp, bx, by, inPins, outX, outY });
      }
    }
  }

  // Register output terminals as sinks
  if (circuit.outputs) {
    const outCol = maxCol + 1;
    const destX = x(outCol);
    for (const out of circuit.outputs) {
      const dy = y(out.row);
      if (!sinks.has(out.net)) sinks.set(out.net, []);
      sinks.get(out.net).push({ dx: destX, dy, col: outCol, isTerminal: true, label: out.id });
      fanout.set(out.net, (fanout.get(out.net) || 0) + 1);
    }
  }

  // Group sinks by destination column to assign channel routing offsets
  // k is index of distinct net entering that destination column
  const colNets = new Map();
  for (const [net, sinkList] of sinks.entries()) {
    for (const s of sinkList) {
      if (!colNets.has(s.col)) colNets.set(s.col, []);
      const list = colNets.get(s.col);
      if (!list.includes(net)) list.push(net);
    }
  }

  // Layers inside SVG: Wires first, then Components, then Terminals & Badges
  const wiresGroup = createSvgElement('g', { class: 'circuit-wires-layer' });
  const componentsGroup = createSvgElement('g', { class: 'circuit-components-layer' });
  const overlaysGroup = createSvgElement('g', { class: 'circuit-overlays-layer' });

  svg.appendChild(wiresGroup);
  svg.appendChild(componentsGroup);
  svg.appendChild(overlaysGroup);

  // References for dynamic updates
  const netElements = new Map(); // netName -> Array<{ el, type }>
  const badgeElements = [];      // Array<{ el, badgeTemplate, net }>
  const seg7Elements = [];       // Array<{ segElMap, netList }>
  const ffLedElements = [];      // Array<{ el, net }>

  function registerNetElement(net, el, type) {
    if (!netElements.has(net)) netElements.set(net, []);
    netElements.get(net).push({ el, type });
  }

  // Draw Input Terminals
  if (circuit.inputs) {
    for (const inp of circuit.inputs) {
      const iy = y(inp.row);
      const text = createSvgElement('text', {
        x: X0 - 16,
        y: iy + 4,
        'text-anchor': 'end',
        'font-family': 'var(--font-mono)',
        'font-size': '12px',
        'font-weight': '600',
        fill: 'var(--ink)'
      });
      text.textContent = inp.id;
      overlaysGroup.appendChild(text);

      const dot = createSvgElement('circle', {
        cx: X0,
        cy: iy,
        r: 3.5,
        fill: 'var(--sig-low)',
        class: 'terminal-dot',
        'data-net': inp.id
      });
      registerNetElement(inp.id, dot, 'terminal-dot');
      overlaysGroup.appendChild(dot);
    }
  }

  // Draw Output Terminals
  if (circuit.outputs) {
    const outCol = maxCol + 1;
    const destX = x(outCol);
    for (const out of circuit.outputs) {
      const oy = y(out.row);
      const dot = createSvgElement('circle', {
        cx: destX,
        cy: oy,
        r: 3.5,
        fill: 'var(--sig-low)',
        class: 'terminal-dot',
        'data-net': out.net
      });
      registerNetElement(out.net, dot, 'terminal-dot');
      overlaysGroup.appendChild(dot);

      const text = createSvgElement('text', {
        x: destX + 14,
        y: oy + 4,
        'text-anchor': 'start',
        'font-family': 'var(--font-mono)',
        'font-size': '12px',
        'font-weight': '600',
        fill: 'var(--ink)'
      });
      text.textContent = out.id;
      overlaysGroup.appendChild(text);
    }
  }

  // Draw Wires
  for (const [net, sinkList] of sinks.entries()) {
    const driver = drivers.get(net);
    if (!driver) continue;

    const { sx, sy } = driver;
    const netFanout = fanout.get(net) || 1;

    // Source junction dot if fanout > 1
    if (netFanout > 1) {
      const srcDot = createSvgElement('circle', {
        cx: sx,
        cy: sy,
        r: 3,
        fill: 'var(--sig-low)',
        class: 'junction-dot',
        'data-net': net
      });
      registerNetElement(net, srcDot, 'junction-dot');
      wiresGroup.appendChild(srcDot);
    }

    for (const sink of sinkList) {
      const { dx, dy, col } = sink;
      const kList = colNets.get(col) || [];
      const k = Math.max(0, kList.indexOf(net));
      let pathD = '';

      if (sy === dy) {
        pathD = `M ${sx} ${sy} H ${dx}`;
      } else {
        const cx = dx - 24 - 8 * k;
        pathD = `M ${sx} ${sy} H ${cx} V ${dy} H ${dx}`;

        if (netFanout > 1) {
          const juncDot = createSvgElement('circle', {
            cx,
            cy: sy,
            r: 3,
            fill: 'var(--sig-low)',
            class: 'junction-dot',
            'data-net': net
          });
          registerNetElement(net, juncDot, 'junction-dot');
          wiresGroup.appendChild(juncDot);
        }
      }

      // Visible wire path
      const wirePath = createSvgElement('path', {
        d: pathD,
        class: 'wire wire-low',
        'data-net': net,
      });
      registerNetElement(net, wirePath, 'wire');
      wiresGroup.appendChild(wirePath);

      // Invisible thick companion path for probe hit-testing
      const probePath = createSvgElement('path', {
        d: pathD,
        fill: 'none',
        stroke: 'transparent',
        'stroke-width': '14',
        'pointer-events': 'stroke',
        'data-net': net
      });
      wiresGroup.appendChild(probePath);
    }
  }

  // Draw Components
  for (const info of componentInfo) {
    const { comp } = info;

    if (comp.type === 'BLOCK') {
      const { bx, by, w, h, inPins, outPins } = info;
      const blockG = createSvgElement('g', { class: 'circuit-block', id: `comp-${comp.id}` });

      if (comp.shape === 'trapezoid') {
        const poly = createSvgElement('polygon', {
          points: `${bx},${by} ${bx + w},${by + h * 0.2} ${bx + w},${by + h * 0.8} ${bx},${by + h}`,
          class: 'gate-body'
        });
        blockG.appendChild(poly);
      } else {
        const rect = createSvgElement('rect', {
          x: bx,
          y: by,
          width: w,
          height: h,
          rx: 4,
          class: 'gate-body'
        });
        blockG.appendChild(rect);
      }

      // Block title label
      const title = createSvgElement('text', {
        x: bx + w / 2,
        y: by + 16,
        'text-anchor': 'middle',
        'font-family': 'var(--font-mono)',
        'font-size': '11px',
        'font-weight': '600',
        fill: 'var(--ink)'
      });
      title.textContent = comp.label || comp.id;
      blockG.appendChild(title);

      // Pins and labels
      for (const pin of inPins) {
        const lbl = createSvgElement('text', {
          x: bx + 6,
          y: pin.dy + 3.5,
          'text-anchor': 'start',
          'font-family': 'var(--font-mono)',
          'font-size': '10px',
          fill: 'var(--muted)'
        });
        lbl.textContent = pin.label;
        blockG.appendChild(lbl);

        // Clock triangle marker for CLK pin
        if (pin.label === 'CLK') {
          const tri = createSvgElement('path', {
            d: `M ${bx} ${pin.dy - 5} L ${bx + 7} ${pin.dy} L ${bx} ${pin.dy + 5}`,
            fill: 'none',
            stroke: 'var(--ink)',
            'stroke-width': '1.5'
          });
          blockG.appendChild(tri);
        }
      }

      for (const pin of outPins) {
        const lbl = createSvgElement('text', {
          x: bx + w - 6,
          y: pin.dy + 3.5,
          'text-anchor': 'end',
          'font-family': 'var(--font-mono)',
          'font-size': '10px',
          fill: 'var(--muted)'
        });
        lbl.textContent = pin.label;
        blockG.appendChild(lbl);

        // If unconnected block output (e.g. Q0, Q1, Q2 in exp 05)
        if (!sinks.has(pin.net) && (!circuit.outputs || !circuit.outputs.some(o => o.net === pin.net))) {
          const stub = createSvgElement('line', {
            x1: pin.sx,
            y1: pin.sy,
            x2: pin.sx + 16,
            y2: pin.sy,
            class: 'wire wire-low',
            'data-net': pin.net
          });
          registerNetElement(pin.net, stub, 'wire');
          blockG.appendChild(stub);

          const probeStub = createSvgElement('line', {
            x1: pin.sx,
            y1: pin.sy,
            x2: pin.sx + 16,
            y2: pin.sy,
            fill: 'none',
            stroke: 'transparent',
            'stroke-width': '14',
            'pointer-events': 'stroke',
            'data-net': pin.net
          });
          blockG.appendChild(probeStub);

          const stubLbl = createSvgElement('text', {
            x: pin.sx + 20,
            y: pin.sy + 3.5,
            'text-anchor': 'start',
            'font-family': 'var(--font-mono)',
            'font-size': '10px',
            'font-weight': '600',
            fill: 'var(--ink)'
          });
          stubLbl.textContent = pin.label;
          blockG.appendChild(stubLbl);
        }
      }

      // Optional LED in top-right corner of FF
      if (comp.led) {
        const ledCircle = createSvgElement('circle', {
          cx: bx + w - 12,
          cy: by + 12,
          r: 5,
          fill: 'var(--pane)',
          stroke: 'var(--border)',
          'stroke-width': 1,
          'data-net': comp.led
        });
        ffLedElements.push({ el: ledCircle, net: comp.led });
        blockG.appendChild(ledCircle);
      }

      // T = 1 note under Flip-Flops
      if (comp.label && comp.label.startsWith('T-FF')) {
        const tNote = createSvgElement('text', {
          x: bx + w / 2,
          y: by + h + 16,
          'text-anchor': 'middle',
          'font-family': 'var(--font-mono)',
          'font-size': '10px',
          fill: 'var(--muted)'
        });
        tNote.textContent = 'T = 1';
        blockG.appendChild(tNote);
      }

      componentsGroup.appendChild(blockG);
    } else if (comp.type === 'SEG7') {
      const { bx, by, inPins, scale } = info;
      const seg7G = createSvgElement('g', {
        class: 'circuit-seg7',
        transform: `translate(${bx}, ${by}) scale(${scale})`
      });

      // Frame
      const frame = createSvgElement('rect', {
        x: 0,
        y: 0,
        width: 58,
        height: 106,
        rx: 4,
        fill: '#ffffff',
        stroke: 'var(--border)',
        'stroke-width': 1
      });
      seg7G.appendChild(frame);

      // 7 Segments geometry
      const SEG_GEO = {
        a: { x: 10, y: 0, w: 40, h: 8 },
        b: { x: 50, y: 10, w: 8, h: 40 },
        c: { x: 50, y: 58, w: 8, h: 40 },
        d: { x: 10, y: 98, w: 40, h: 8 },
        e: { x: 0, y: 58, w: 8, h: 40 },
        f: { x: 0, y: 10, w: 8, h: 40 },
        g: { x: 10, y: 49, w: 40, h: 8 }
      };

      const segElMap = {};
      for (const [sKey, geo] of Object.entries(SEG_GEO)) {
        const segRect = createSvgElement('rect', {
          x: geo.x,
          y: geo.y,
          width: geo.w,
          height: geo.h,
          rx: 3,
          fill: 'var(--pane)',
          stroke: 'var(--border)',
          'stroke-width': 1,
          'data-seg': sKey
        });
        seg7G.appendChild(segRect);
        segElMap[sKey] = segRect;
      }

      // Input pin labels on the left edge
      for (const pin of inPins) {
        const unscaledY = (pin.dy - by) / scale;
        const lbl = createSvgElement('text', {
          x: 4,
          y: unscaledY + 3.5,
          'text-anchor': 'start',
          'font-family': 'var(--font-mono)',
          'font-size': '8px',
          fill: 'var(--muted)'
        });
        lbl.textContent = pin.label;
        seg7G.appendChild(lbl);
      }

      seg7Elements.push({ segElMap, netList: comp.in });
      componentsGroup.appendChild(seg7G);
    } else {
      // Standard Gate
      const { bx, by, comp: gateComp } = info;
      const gateG = createSvgElement('g', { class: 'circuit-gate', id: `gate-${gateComp.id}` });

      const gateShapeG = createSvgElement('g', { transform: `translate(${bx}, ${by})` });

      if (gateComp.type === 'AND' || gateComp.type === 'NAND') {
        const p = createSvgElement('path', { d: GATE_PATHS.AND, class: 'gate-body' });
        gateShapeG.appendChild(p);
        if (gateComp.type === 'NAND') {
          const bubble = createSvgElement('circle', { cx: 60, cy: 24, r: 4, class: 'gate-bubble' });
          gateShapeG.appendChild(bubble);
        }
      } else if (gateComp.type === 'OR' || gateComp.type === 'NOR') {
        const p = createSvgElement('path', { d: GATE_PATHS.OR, class: 'gate-body' });
        gateShapeG.appendChild(p);
        if (gateComp.type === 'NOR') {
          const bubble = createSvgElement('circle', { cx: 60, cy: 24, r: 4, class: 'gate-bubble' });
          gateShapeG.appendChild(bubble);
        }
      } else if (gateComp.type === 'XOR') {
        const extra = createSvgElement('path', { d: GATE_PATHS.XOR_EXTRA, fill: 'none', stroke: 'var(--ink)', 'stroke-width': '1.5' });
        const p = createSvgElement('path', { d: GATE_PATHS.OR, class: 'gate-body' });
        gateShapeG.appendChild(extra);
        gateShapeG.appendChild(p);
      } else if (gateComp.type === 'NOT') {
        const p = createSvgElement('path', { d: GATE_PATHS.NOT, class: 'gate-body' });
        const bubble = createSvgElement('circle', { cx: 52, cy: 24, r: 4, class: 'gate-bubble' });
        gateShapeG.appendChild(p);
        gateShapeG.appendChild(bubble);
      }

      gateG.appendChild(gateShapeG);

      // Gate ID below
      const idText = createSvgElement('text', {
        x: bx + 28,
        y: by + 60,
        class: 'gate-label'
      });
      idText.textContent = gateComp.id;
      gateG.appendChild(idText);

      // Optional Badge above gate output
      if (gateComp.badge) {
        const badgeG = createSvgElement('g', { class: 'gate-badge' });
        const badgeBg = createSvgElement('rect', {
          x: bx + 20,
          y: by - 16,
          width: 84,
          height: 18,
          class: 'badge-rect'
        });
        const badgeTxt = createSvgElement('text', {
          x: bx + 62,
          y: by - 7,
          class: 'badge-text'
        });
        badgeTxt.textContent = `${gateComp.badge} = 0`;
        badgeG.appendChild(badgeBg);
        badgeG.appendChild(badgeTxt);
        overlaysGroup.appendChild(badgeG);

        badgeElements.push({ el: badgeTxt, badgeTemplate: gateComp.badge, net: gateComp.out });
      }

      componentsGroup.appendChild(gateG);
    }
  }

  svgParent.appendChild(svg);

  // Return Controller
  return {
    update(nets, opts = {}) {
      const { dim = [], clk = null } = opts;

      // Update all nets
      for (const [netName, items] of netElements.entries()) {
        const val = nets[netName] ?? 0;
        const isDim = dim.includes(netName);
        const isHigh = val === 1 && !isDim;
        const isAmber = netName === 'CLK' && clk === 1;

        for (const { el, type } of items) {
          if (type === 'wire') {
            el.classList.toggle('wire-high', isHigh && !isAmber);
            el.classList.toggle('wire-low', !isHigh && !isAmber);
            el.classList.toggle('wire-amber', isAmber);
            el.classList.toggle('wire-dim', isDim);
          } else if (type === 'terminal-dot' || type === 'junction-dot') {
            if (isAmber) {
              el.setAttribute('fill', 'var(--amber)');
            } else if (isDim) {
              el.setAttribute('fill', 'var(--sig-low)');
            } else {
              el.setAttribute('fill', isHigh ? 'var(--sig-high)' : 'var(--sig-low)');
            }
          }
        }
      }

      // Refresh badges
      for (const { el, badgeTemplate, net } of badgeElements) {
        const val = nets[net] ?? 0;
        el.textContent = `${badgeTemplate} = ${val}`;
      }

      // Refresh SEG7 segments
      for (const { segElMap, netList } of seg7Elements) {
        for (const netName of netList) {
          const val = nets[netName] ?? 0;
          const segEl = segElMap[netName];
          if (segEl) {
            segEl.setAttribute('fill', val === 1 ? 'var(--ink)' : 'var(--pane)');
            segEl.setAttribute('stroke', val === 1 ? 'var(--ink)' : 'var(--border)');
          }
        }
      }

      // Refresh Flip-Flop LEDs
      for (const { el, net } of ffLedElements) {
        const val = nets[net] ?? 0;
        el.setAttribute('fill', val === 1 ? 'var(--sig-high)' : 'var(--pane)');
      }
    }
  };
}
