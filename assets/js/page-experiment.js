// ApexLogic - page-experiment.js
// Experiment page controller: circuit simulation, tabs, switching, and verification

import { store, renderHeader, playClick } from './app.js';
import { getExperiment } from './experiments/index.js';
import { createCircuitView } from './renderer.js';
import { createProbe } from './probe.js';
import { createTruthTable } from './truthtable.js';
import { createWaveform } from './waveform.js';
import { renderViva } from './viva.js';
import { tick } from './experiments/exp05.js';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const expId = params.get('id') || '01';
  const experiment = getExperiment(expId);

  if (!experiment) {
    window.location.href = 'index.html';
    return;
  }

  // Active mode resolution
  let currentModeId = params.get('mode') || experiment.modes[0].id;
  let currentMode = experiment.modes.find(m => m.id === currentModeId) || experiment.modes[0];
  currentModeId = currentMode.id;

  // Header
  const headerContainer = document.getElementById('site-header');
  function initHeader() {
    renderHeader(headerContainer, {
      title: `${experiment.id} — ${experiment.title}`,
      expId: experiment.id,
      mode: currentModeId,
      showActions: true,
      onReset: handleReset
    });
  }
  initHeader();

  // Page title block
  document.getElementById('exp-eyebrow').textContent = `EXPERIMENT ${experiment.id}`;
  document.getElementById('exp-title').textContent = experiment.title;
  document.getElementById('exp-category').textContent = experiment.category;
  document.title = `${experiment.id} — ${experiment.title} · ApexLogic`;

  // Tabs setup
  const tabBtns = {
    simulate: document.getElementById('tab-btn-simulate'),
    manual: document.getElementById('tab-btn-manual'),
    viva: document.getElementById('tab-btn-viva')
  };
  const panels = {
    simulate: document.getElementById('panel-simulate'),
    manual: document.getElementById('panel-manual'),
    viva: document.getElementById('panel-viva')
  };

  function switchTab(tabKey) {
    for (const [key, btn] of Object.entries(tabBtns)) {
      const active = key === tabKey;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      if (panels[key]) {
        if (active) {
          panels[key].removeAttribute('hidden');
        } else {
          panels[key].setAttribute('hidden', '');
        }
      }
    }
    history.replaceState(null, '', `#${tabKey}`);
  }

  for (const [key, btn] of Object.entries(tabBtns)) {
    btn.addEventListener('click', () => switchTab(key));
  }

  const initialHash = window.location.hash.replace('#', '');
  if (['simulate', 'manual', 'viva'].includes(initialHash)) {
    switchTab(initialHash);
  }

  // Render Manual Tab
  const manualContainer = document.getElementById('manual-content-container');
  manualContainer.innerHTML = `
    <div class="manual-section">
      <span class="manual-heading">Aim</span>
      <p class="manual-aim">${experiment.aim}</p>
    </div>
    <div class="manual-section">
      <span class="manual-heading">Theory</span>
      ${experiment.manual.theory.map(t => `<p>${t}</p>`).join('')}
    </div>
    <div class="manual-section">
      <span class="manual-heading">Boolean Equations</span>
      <div class="manual-eq-box">
        ${experiment.manual.equationsHtml.map(eq => `<div>${eq}</div>`).join('')}
      </div>
    </div>
    <div class="manual-section">
      <span class="manual-heading">ICs Used</span>
      <ul class="manual-ol" style="list-style-type: disc;">
        ${experiment.manual.ics.map(ic => `<li>${ic}</li>`).join('')}
      </ul>
    </div>
    <div class="manual-section">
      <span class="manual-heading">Procedure</span>
      <ol class="manual-ol">
        ${experiment.manual.procedure.map(step => `<li>${step}</li>`).join('')}
      </ol>
    </div>
  `;

  // Render Viva Tab
  const vivaContainer = document.getElementById('viva-content-container');
  renderViva(vivaContainer, experiment);

  // Mode Switcher (if > 1 mode)
  const modeSwitcherContainer = document.getElementById('mode-switcher-container');
  if (experiment.modes.length > 1) {
    modeSwitcherContainer.innerHTML = `
      <div class="mode-segmented-control" role="group" aria-label="Circuit mode selector">
        ${experiment.modes.map(m => `
          <button type="button" class="mode-segment-btn ${m.id === currentModeId ? 'active' : ''}" data-mode="${m.id}">
            ${m.label}
          </button>
        `).join('')}
      </div>
    `;

    modeSwitcherContainer.querySelectorAll('.mode-segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newModeId = btn.getAttribute('data-mode');
        if (newModeId !== currentModeId) {
          currentModeId = newModeId;
          currentMode = experiment.modes.find(m => m.id === currentModeId);
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('mode', currentModeId);
          window.history.replaceState(null, '', newUrl.toString());

          modeSwitcherContainer.querySelectorAll('.mode-segment-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-mode') === currentModeId);
          });

          initHeader();
          initSimulation();
        }
      });
    });
  } else {
    modeSwitcherContainer.innerHTML = '';
  }

  // --- Simulation Controller ---
  let state = { inputs: {}, runtime: {} };
  let circuitView = null;
  let truthTable = null;
  let probe = null;
  let waveform = null;
  let autoRunTimer = null;
  let latestNets = {};

  function initSimulation() {
    // Stop any existing intervals
    if (autoRunTimer) {
      clearInterval(autoRunTimer);
      autoRunTimer = null;
    }

    const stateKey = `apexlogic.state.${experiment.id}.${currentMode.id}`;
    const savedState = store.get(stateKey, null);

    // Initial inputs from saved or mode defaults
    state.inputs = {};
    if (currentMode.inputs) {
      for (const inp of currentMode.inputs) {
        state.inputs[inp.id] = (savedState && savedState.inputs && savedState.inputs[inp.id] !== undefined)
          ? savedState.inputs[inp.id]
          : inp.default;
      }
    }

    // Initial runtime
    if (experiment.id === '05') {
      state.runtime = (savedState && savedState.runtime) ? savedState.runtime : { q: [0, 0, 0], clk: 0 };
    } else {
      state.runtime = {};
    }

    // Canvas toolbar equation
    const eqContainer = document.getElementById('canvas-equation');
    eqContainer.innerHTML = currentMode.equationHtml || '';

    // Canvas cards and containers
    const canvasCard = document.getElementById('canvas-card');
    const svgContainer = document.getElementById('circuit-svg-container');
    const inputsContainer = document.getElementById('canvas-inputs-container');
    const outputsContainer = document.getElementById('canvas-outputs-container');
    const tableContainer = document.getElementById('truth-table-container');
    const statusContainer = document.getElementById('status-list-container');
    const waveformSection = document.getElementById('waveform-section');
    const waveformContainer = document.getElementById('waveform-container');

    // Create SVG circuit view
    circuitView = createCircuitView(svgContainer, currentMode.circuit);

    // Truth Table
    truthTable = createTruthTable(tableContainer, currentMode, { expId: experiment.id });

    // Probe
    const probeToggleBtn = document.getElementById('probe-toggle-btn');
    if (probe) probe.destroy();
    probe = createProbe(canvasCard, probeToggleBtn, () => latestNets);

    // Waveform (Exp 05 only)
    if (experiment.id === '05') {
      waveformSection.style.display = 'block';
      waveform = createWaveform(waveformContainer, [
        { key: 'CLK', label: 'CLK', color: 'var(--amber)' },
        { key: 'Q0', label: 'Q0 (f/2)', color: 'var(--sig-high)' },
        { key: 'Q1', label: 'Q1 (f/4)', color: 'var(--sig-high)' },
        { key: 'Q2', label: 'Q2 (f/8)', color: 'var(--sig-high)' }
      ]);
    } else {
      waveformSection.style.display = 'none';
      waveform = null;
    }

    // Build Inputs UI
    buildInputsUI(inputsContainer);

    // Build Outputs UI
    buildOutputsUI(outputsContainer);

    // Initial refresh without marking as visited
    refresh(true);
  }

  function buildInputsUI(container) {
    container.innerHTML = '';

    if (experiment.id === '05') {
      // Clock control bar
      container.className = 'clock-controls-bar';
      container.innerHTML = `
        <button type="button" class="btn btn-primary" id="clk-step-btn">Step Clock</button>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="switch" id="clk-autorun-switch" role="switch" aria-checked="false" aria-label="Auto run clock">
            <span class="knob"></span>
          </button>
          <span class="mono" style="font-size: 13px;">Auto Run</span>
        </div>
        <div class="clock-speed-slider">
          <input type="range" id="clk-speed-slider" min="0.5" max="4.0" step="0.5" value="1.0" />
          <span id="clk-speed-val">1.0 Hz</span>
        </div>
        <button type="button" class="btn btn-ghost" id="clk-clear-btn">Clear</button>
      `;

      const stepBtn = container.querySelector('#clk-step-btn');
      const autoSwitch = container.querySelector('#clk-autorun-switch');
      const speedSlider = container.querySelector('#clk-speed-slider');
      const speedVal = container.querySelector('#clk-speed-val');
      const clearBtn = container.querySelector('#clk-clear-btn');

      function executeTick() {
        playClick();
        state.runtime = tick(state.runtime);

        // Push rising edge sample
        if (waveform) {
          waveform.push({
            CLK: 1,
            Q0: state.runtime.q[0],
            Q1: state.runtime.q[1],
            Q2: state.runtime.q[2]
          });
        }

        // Visual flash of CLK (amber)
        state.runtime.clk = 1;
        refresh(false);

        setTimeout(() => {
          state.runtime.clk = 0;
          if (waveform) {
            waveform.push({
              CLK: 0,
              Q0: state.runtime.q[0],
              Q1: state.runtime.q[1],
              Q2: state.runtime.q[2]
            });
          }
          refresh(false);
        }, 150);
      }

      stepBtn.addEventListener('click', () => {
        executeTick();
      });

      function restartAutoRun() {
        if (autoRunTimer) clearInterval(autoRunTimer);
        const hz = parseFloat(speedSlider.value) || 1;
        autoRunTimer = setInterval(() => {
          executeTick();
        }, 1000 / hz);
      }

      autoSwitch.addEventListener('click', () => {
        const isChecked = autoSwitch.getAttribute('aria-checked') === 'true';
        const next = !isChecked;
        autoSwitch.setAttribute('aria-checked', next ? 'true' : 'false');
        if (next) {
          restartAutoRun();
        } else {
          if (autoRunTimer) {
            clearInterval(autoRunTimer);
            autoRunTimer = null;
          }
        }
      });

      speedSlider.addEventListener('input', () => {
        const hz = parseFloat(speedSlider.value).toFixed(1);
        speedVal.textContent = `${hz} Hz`;
        if (autoSwitch.getAttribute('aria-checked') === 'true') {
          restartAutoRun();
        }
      });

      clearBtn.addEventListener('click', () => {
        state.runtime = { q: [0, 0, 0], clk: 0 };
        if (waveform) waveform.clear();
        refresh(false);
      });

      return;
    }

    // Default: Tactile switch row
    container.className = 'input-array-wrapper';

    if (currentMode.inputs && currentMode.inputs.length > 0) {
      currentMode.inputs.forEach((inp, idx) => {
        // Group separation for exp 03
        if (experiment.id === '03' && (idx === 4 || idx === 6)) {
          const sep = document.createElement('div');
          sep.style.width = '1px';
          sep.style.height = '36px';
          sep.style.backgroundColor = 'var(--border)';
          sep.style.margin = '0 6px';
          container.appendChild(sep);
        }

        const item = document.createElement('div');
        item.className = 'input-item';
        item.innerHTML = `
          <button class="switch" id="switch-${inp.id}" role="switch" aria-checked="${state.inputs[inp.id] ? 'true' : 'false'}" aria-label="Input ${inp.label}">
            <span class="knob"></span>
          </button>
          <div class="input-label" id="label-${inp.id}">
            <span>${inp.label}</span>
          </div>
        `;

        const swBtn = item.querySelector('.switch');
        swBtn.addEventListener('click', () => {
          const curVal = state.inputs[inp.id] ? 1 : 0;
          const nextVal = curVal ? 0 : 1;
          state.inputs[inp.id] = nextVal;
          swBtn.setAttribute('aria-checked', nextVal ? 'true' : 'false');
          playClick();
          syncStepperFromSwitches();
          refresh(false);
        });

        container.appendChild(item);
      });
    }

    // Exp 04 Decimal Stepper
    if (experiment.id === '04') {
      const stepperDiv = document.createElement('div');
      stepperDiv.className = 'stepper-container';
      stepperDiv.innerHTML = `
        <span class="eyebrow" style="margin-right: 4px;">Decimal</span>
        <button type="button" class="stepper-btn" id="stepper-dec-btn">−</button>
        <span class="stepper-readout" id="stepper-readout">0</span>
        <button type="button" class="stepper-btn" id="stepper-inc-btn">+</button>
      `;
      container.appendChild(stepperDiv);

      const readout = stepperDiv.querySelector('#stepper-readout');
      const decBtn = stepperDiv.querySelector('#stepper-dec-btn');
      const incBtn = stepperDiv.querySelector('#stepper-inc-btn');

      function updateSwitchesFromVal(val) {
        val = Math.max(0, Math.min(9, val));
        state.inputs.B3 = (val >> 3) & 1;
        state.inputs.B2 = (val >> 2) & 1;
        state.inputs.B1 = (val >> 1) & 1;
        state.inputs.B0 = val & 1;

        ['B3', 'B2', 'B1', 'B0'].forEach(id => {
          const sw = container.querySelector(`#switch-${id}`);
          if (sw) sw.setAttribute('aria-checked', state.inputs[id] ? 'true' : 'false');
        });

        playClick();
        syncStepperFromSwitches();
        refresh(false);
      }

      decBtn.addEventListener('click', () => {
        const cur = (state.inputs.B3 * 8) + (state.inputs.B2 * 4) + (state.inputs.B1 * 2) + state.inputs.B0;
        if (cur > 9) {
          updateSwitchesFromVal(9);
        } else {
          updateSwitchesFromVal(Math.max(0, cur - 1));
        }
      });

      incBtn.addEventListener('click', () => {
        const cur = (state.inputs.B3 * 8) + (state.inputs.B2 * 4) + (state.inputs.B1 * 2) + state.inputs.B0;
        if (cur >= 9) {
          updateSwitchesFromVal(0);
        } else {
          updateSwitchesFromVal(cur + 1);
        }
      });
    }
  }

  function syncStepperFromSwitches() {
    if (experiment.id !== '04') return;
    const readout = document.getElementById('stepper-readout');
    if (!readout) return;
    const val = (state.inputs.B3 * 8) + (state.inputs.B2 * 4) + (state.inputs.B1 * 2) + state.inputs.B0;
    if (val <= 9) {
      readout.textContent = String(val);
      readout.style.color = 'var(--ink)';
    } else {
      readout.textContent = `${val} (invalid)`;
      readout.style.color = 'var(--danger)';
    }
  }

  function buildOutputsUI(container) {
    container.innerHTML = '';
    container.className = 'output-array-wrapper';

    if (experiment.id === '04') {
      // 7-segment display shows the outputs inside the SVG; below display is invalid badge
      container.innerHTML = `
        <div id="bcd-invalid-badge-wrapper" style="display: none;">
          <span class="badge-invalid">Invalid BCD Input (Range: 0–9)</span>
        </div>
      `;
      return;
    }

    if (experiment.id === '05') {
      // State matrix for counter
      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: baseline; gap: 16px;">
            <span class="mono" style="font-size: 16px; font-weight: 600;" id="counter-bits-readout">Q2 Q1 Q0 = 000₂</span>
            <span class="mono" style="font-size: 14px; color: var(--muted);" id="counter-dec-readout">Decimal: 0</span>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="output-item">
              <span class="lamp" id="lamp-Q2"></span>
              <span class="lamp-label">Q2</span>
            </div>
            <div class="output-item">
              <span class="lamp" id="lamp-Q1"></span>
              <span class="lamp-label">Q1</span>
            </div>
            <div class="output-item">
              <span class="lamp" id="lamp-Q0"></span>
              <span class="lamp-label">Q0</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Default Lamps
    if (currentMode.outputs) {
      currentMode.outputs.forEach(out => {
        const item = document.createElement('div');
        item.className = 'output-item';
        item.innerHTML = `
          <span class="lamp" id="lamp-${out.id}"></span>
          <span class="lamp-label">
            ${out.label}
            <span class="lamp-val" id="val-${out.id}">0</span>
          </span>
        `;
        container.appendChild(item);
      });
    }

    // Exp 02 Decimal Sum Line
    if (experiment.id === '02') {
      const decLine = document.createElement('div');
      decLine.id = 'adder-decimal-line';
      decLine.className = 'mono';
      decLine.style.cssText = 'width: 100%; font-size: 14px; color: var(--muted); border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px;';
      container.appendChild(decLine);
    }
  }

  function updateStatus(nets, extra) {
    const statusContainer = document.getElementById('status-list-container');
    if (!statusContainer) return;

    if (experiment.id === '01') {
      const match = nets.Y === currentMode.reference(state.inputs).Y;
      statusContainer.innerHTML = `
        <div class="status-item">NAND network = native ${currentMode.label} gate ${match ? '✓' : '✗ mismatch'}</div>
        <div class="status-item">Gates used: ${currentMode.gateCount} NAND</div>
      `;
    } else if (experiment.id === '02') {
      const ref = currentMode.reference(state.inputs);
      const isMatch = currentMode.id === 'half'
        ? (nets.Sum === ref.Sum && nets.Carry === ref.Carry)
        : (nets.Sum === ref.Sum && nets.Cout === ref.Cout);

      statusContainer.innerHTML = `
        <div class="status-item">Output matches reference ${isMatch ? '✓' : '✗ mismatch'}</div>
        <div class="status-item">Gates used: ${currentMode.gateCount}</div>
      `;
    } else if (experiment.id === '03') {
      const isEn = extra.enabled;
      const sel = extra.selected;
      statusContainer.innerHTML = `
        <div class="status-item">${isEn ? `Selected input: D${sel} = ${state.inputs['D' + sel]}` : 'Disabled — output forced to 0'}</div>
        <div class="status-item">Output Y = ${nets.Y}</div>
      `;
    } else if (experiment.id === '04') {
      const val = extra.value;
      const isValid = extra.isValid;
      statusContainer.innerHTML = `
        <div class="status-item">Input = ${String((val >> 3) & 1)}${String((val >> 2) & 1)}${String((val >> 1) & 1)}${String(val & 1)}₂ (${val})</div>
        <div class="status-item">Display: ${isValid ? val : '— (invalid)'}</div>
      `;
    } else if (experiment.id === '05') {
      const [q0, q1, q2] = extra.q;
      const dec = extra.dec;
      statusContainer.innerHTML = `
        <div class="status-item">Count: ${dec} (${q2}${q1}${q0}₂)</div>
        <div class="status-item">Counts 0–7, then wraps to 0</div>
      `;
    }
  }

  function refresh(isInitial = false) {
    const { nets, extra } = currentMode.compute(state.inputs, state.runtime);
    latestNets = nets;

    // Update SVG circuit view
    circuitView.update(nets, {
      dim: extra?.dim ?? [],
      clk: nets.CLK ?? null
    });

    // Update output lamps & indicators
    if (experiment.id === '04') {
      const badge = document.getElementById('bcd-invalid-badge-wrapper');
      if (badge) badge.style.display = extra.isValid ? 'none' : 'block';
    } else if (experiment.id === '05') {
      const [q0, q1, q2] = extra.q;
      const bitsEl = document.getElementById('counter-bits-readout');
      const decEl = document.getElementById('counter-dec-readout');
      if (bitsEl) bitsEl.textContent = `Q2 Q1 Q0 = ${q2}${q1}${q0}₂`;
      if (decEl) decEl.textContent = `Decimal: ${extra.dec}`;

      const l2 = document.getElementById('lamp-Q2');
      const l1 = document.getElementById('lamp-Q1');
      const l0 = document.getElementById('lamp-Q0');
      if (l2) l2.classList.toggle('active', q2 === 1);
      if (l1) l1.classList.toggle('active', q1 === 1);
      if (l0) l0.classList.toggle('active', q0 === 1);
    } else {
      if (currentMode.outputs) {
        currentMode.outputs.forEach(out => {
          const lamp = document.getElementById(`lamp-${out.id}`);
          const valEl = document.getElementById(`val-${out.id}`);
          const val = nets[out.net] ?? 0;
          if (lamp) lamp.classList.toggle('active', val === 1);
          if (valEl) valEl.textContent = String(val);
        });
      }

      if (experiment.id === '02') {
        const decLine = document.getElementById('adder-decimal-line');
        if (decLine) {
          if (currentMode.id === 'half') {
            const dec = state.inputs.A + state.inputs.B;
            decLine.textContent = `${state.inputs.A} + ${state.inputs.B} = ${dec} → Sum = ${nets.Sum}, Carry = ${nets.Carry}`;
          } else {
            const dec = state.inputs.A + state.inputs.B + state.inputs.Cin;
            decLine.textContent = `${state.inputs.A} + ${state.inputs.B} + ${state.inputs.Cin} = ${dec} → Sum = ${nets.Sum}, Cout = ${nets.Cout}`;
          }
        }
      }

      if (experiment.id === '03') {
        // Tag selected switch label
        ['D0', 'D1', 'D2', 'D3'].forEach((dId, idx) => {
          const lbl = document.getElementById(`label-${dId}`);
          if (lbl) {
            const isSel = idx === extra.selected && extra.enabled;
            lbl.innerHTML = `<span>${dId}</span>${isSel ? '<span class="sel-badge">SEL</span>' : ''}`;
          }
        });

        // Live equation highlighting in toolbar
        const eqContainer = document.getElementById('canvas-equation');
        if (eqContainer) {
          const terms = [
            '<span class="ov">S₁</span><span class="ov">S₀</span>D₀',
            '<span class="ov">S₁</span>S₀D₁',
            'S₁<span class="ov">S₀</span>D₂',
            'S₁S₀D₃'
          ];
          const renderedTerms = terms.map((t, idx) => {
            const isHighlight = extra.enabled && idx === extra.selected;
            return `<span style="${isHighlight ? 'font-weight: 700; color: var(--ink);' : 'color: var(--muted);'}">${t}</span>`;
          }).join(' + ');

          eqContainer.innerHTML = `Y = <span class="ov">E</span>·(${renderedTerms})${!extra.enabled ? ' <span style="color: var(--muted);">(disabled: Y = 0)</span>' : ''}`;
        }
      }
    }

    // Truth Table update
    truthTable.update(state.inputs, state.runtime, isInitial);

    // Status list update
    updateStatus(nets, extra);

    // Persist state
    store.set(`apexlogic.state.${experiment.id}.${currentMode.id}`, state);
  }

  function handleReset() {
    if (autoRunTimer) {
      clearInterval(autoRunTimer);
      autoRunTimer = null;
    }

    // Reset inputs
    state.inputs = {};
    if (currentMode.inputs) {
      for (const inp of currentMode.inputs) {
        state.inputs[inp.id] = inp.default;
      }
    }

    // Reset runtime
    state.runtime = experiment.id === '05' ? { q: [0, 0, 0], clk: 0 } : {};

    // Clear visited rows
    truthTable.resetVisited();

    // Clear waveform
    if (waveform) waveform.clear();

    // Re-sync UI controls
    if (currentMode.inputs) {
      currentMode.inputs.forEach(inp => {
        const sw = document.getElementById(`switch-${inp.id}`);
        if (sw) sw.setAttribute('aria-checked', inp.default ? 'true' : 'false');
      });
    }

    const autoSwitch = document.getElementById('clk-autorun-switch');
    if (autoSwitch) autoSwitch.setAttribute('aria-checked', 'false');

    syncStepperFromSwitches();
    refresh(true);
  }

  // Initial simulation run
  initSimulation();
});
