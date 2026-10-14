// ApexLogic - page-record.js
// Printable Lab Record controller and snapshot builder

import { store } from './app.js';
import { getExperiment } from './experiments/index.js';
import { createCircuitView } from './renderer.js';
import { autoTable } from './truthtable.js';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const expId = params.get('id') || '01';
  const experiment = getExperiment(expId);

  if (!experiment) {
    window.location.href = 'index.html';
    return;
  }

  const modeId = params.get('mode') || experiment.modes[0].id;
  const mode = experiment.modes.find(m => m.id === modeId) || experiment.modes[0];

  // Back link
  const backLink = document.getElementById('record-back-link');
  if (backLink) {
    backLink.href = `experiment.html?id=${expId}&mode=${mode.id}`;
  }

  // Print button
  const printBtn = document.getElementById('print-sheet-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Date
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  document.getElementById('record-date').textContent = dateStr;
  document.getElementById('rec-exp-date').textContent = dateStr;

  // Student details
  const student = store.get('apexlogic.student', { name: '', usn: '', sem: '' });
  document.getElementById('rec-student-name').textContent = student.name || '';
  document.getElementById('rec-student-usn').textContent = student.usn || '';
  document.getElementById('rec-student-sem').textContent = student.sem || '';

  // Title, Aim, Equations
  document.getElementById('rec-exp-name').textContent = `Experiment ${experiment.id} — ${experiment.title} (${mode.label})`;
  document.getElementById('rec-exp-aim').textContent = experiment.aim;
  document.getElementById('rec-exp-equations').innerHTML = mode.equationHtml;

  // Circuit Snapshot
  const savedState = store.get(`apexlogic.state.${experiment.id}.${mode.id}`, null);
  const inputs = {};
  if (mode.inputs) {
    for (const inp of mode.inputs) {
      inputs[inp.id] = (savedState && savedState.inputs && savedState.inputs[inp.id] !== undefined)
        ? savedState.inputs[inp.id]
        : inp.default;
    }
  }

  const runtime = (experiment.id === '05' && savedState && savedState.runtime)
    ? savedState.runtime
    : (experiment.id === '05' ? { q: [0, 0, 0], clk: 0 } : {});

  const snapshotContainer = document.getElementById('rec-circuit-snapshot');
  const view = createCircuitView(snapshotContainer, mode.circuit);
  const { nets, extra } = mode.compute(inputs, runtime);
  view.update(nets, { dim: extra?.dim ?? [], clk: nets.CLK ?? null });

  // Truth Table & Stamp
  const tableData = mode.table || autoTable(mode);
  const visitedRows = new Set(store.get(`apexlogic.rows.${experiment.id}.${mode.id}`, []));
  const totalRequired = tableData.validRowCount !== undefined ? tableData.validRowCount : tableData.rows.length;

  let validCount = 0;
  if (tableData.validRowCount !== undefined) {
    for (const idx of visitedRows) {
      if (idx < tableData.validRowCount) validCount++;
    }
  } else {
    validCount = visitedRows.size;
  }

  const isVerified = validCount >= totalRequired;
  const stampEl = document.getElementById('rec-verif-stamp');
  if (isVerified) {
    stampEl.className = 'verif-stamp stamp-verified';
    stampEl.textContent = 'VERIFIED ✓';
  } else {
    stampEl.className = 'verif-stamp stamp-incomplete';
    stampEl.textContent = `INCOMPLETE — ${validCount}/${totalRequired} rows tested`;
  }

  const truthTableEl = document.getElementById('rec-truth-table');
  truthTableEl.innerHTML = `
    <thead>
      <tr>
        ${tableData.inHeaders.map((h, i) => `
          <th ${i === tableData.inHeaders.length - 1 ? 'class="divider-col"' : ''}>${h}</th>
        `).join('')}
        ${tableData.outHeaders.map(h => `<th>${h}</th>`).join('')}
        <th style="width: 24px;">✓</th>
      </tr>
    </thead>
    <tbody>
      ${tableData.rows.map((r, rIdx) => {
        const isMuted = r.outs.some(val => val === '—');
        const isTested = visitedRows.has(rIdx);
        return `
          <tr class="${isMuted ? 'row-muted' : ''}">
            ${r.ins.map((val, i) => `
              <td ${i === r.ins.length - 1 ? 'class="divider-col"' : ''}>${val}</td>
            `).join('')}
            ${r.outs.map(val => `<td>${val}</td>`).join('')}
            <td class="cell-check">${isTested ? '✓' : ''}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;

  // Viva Voce Breakdown
  const vivaKey = `apexlogic.viva.${experiment.id}`;
  const vivaData = store.get(vivaKey, { answers: [null, null, null] });
  let vivaScore = 0;
  const letters = ['A', 'B', 'C', 'D'];

  const vivaRows = experiment.viva.map((q, idx) => {
    const userAns = vivaData.answers[idx];
    const isCorrect = userAns !== null && userAns === q.correctIndex;
    if (isCorrect) vivaScore++;

    const ansLabel = userAns !== null ? `${letters[userAns]}. ${q.options[userAns]}` : '—';
    const resultSymbol = userAns !== null ? (isCorrect ? '✓' : '✗') : '—';
    const resultColor = userAns !== null ? (isCorrect ? 'var(--sage)' : 'var(--danger)') : 'var(--muted)';

    return `
      <tr>
        <td>Q0${idx + 1}</td>
        <td>${q.question}</td>
        <td>${ansLabel}</td>
        <td style="text-align: center; color: ${resultColor}; font-weight: 600;">${resultSymbol}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('rec-viva-heading').textContent = `Viva Voce: ${vivaScore} / ${experiment.viva.length}`;
  document.getElementById('rec-viva-body').innerHTML = vivaRows;
});
