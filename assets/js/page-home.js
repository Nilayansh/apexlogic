// ApexLogic - page-home.js
// Home page experiment list and progress summary controller

import { store, renderHeader } from './app.js';
import { EXPERIMENTS } from './experiments/index.js';
import { autoTable } from './truthtable.js';

document.addEventListener('DOMContentLoaded', () => {
  const headerContainer = document.getElementById('site-header');
  if (headerContainer) {
    renderHeader(headerContainer);
  }

  const listContainer = document.getElementById('experiments-list');
  if (!listContainer) return;

  listContainer.innerHTML = EXPERIMENTS.map(exp => {
    const firstMode = exp.modes[0];
    const modeId = firstMode.id || 'default';

    // Calculate rows tested for first mode
    const rowKey = `apexlogic.rows.${exp.id}.${modeId}`;
    const visitedRows = store.get(rowKey, []);

    const tableData = firstMode.table || autoTable(firstMode);
    const totalRequired = tableData.validRowCount !== undefined ? tableData.validRowCount : tableData.rows.length;

    let validVisited = 0;
    if (tableData.validRowCount !== undefined) {
      for (const idx of visitedRows) {
        if (idx < tableData.validRowCount) validVisited++;
      }
    } else {
      validVisited = visitedRows.length;
    }

    // Calculate viva score
    const vivaKey = `apexlogic.viva.${exp.id}`;
    const vivaData = store.get(vivaKey, null);
    let vivaCorrect = 0;
    let vivaAnswered = false;

    if (vivaData && Array.isArray(vivaData.answers)) {
      exp.viva.forEach((q, idx) => {
        if (vivaData.answers[idx] !== null) {
          vivaAnswered = true;
          if (vivaData.answers[idx] === q.correctIndex) {
            vivaCorrect++;
          }
        }
      });
    }

    let progressStr = 'Not started';
    if (validVisited > 0 || vivaAnswered) {
      const parts = [];
      if (validVisited > 0) parts.push(`Rows ${validVisited}/${totalRequired}`);
      if (vivaAnswered) parts.push(`Viva ${vivaCorrect}/${exp.viva.length}`);
      progressStr = parts.join(' · ');
    }

    return `
      <a href="experiment.html?id=${exp.id}" class="home-row">
        <div class="home-num">${exp.id}</div>
        <div class="home-info">
          <div class="home-row-title">${exp.title}</div>
          <div class="home-row-category">${exp.category}</div>
        </div>
        <div class="home-progress">
          <span>${progressStr}</span>
          <span class="home-arrow">→</span>
        </div>
      </a>
    `;
  }).join('');
});
