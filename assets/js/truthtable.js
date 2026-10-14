// ApexLogic - truthtable.js
// Truth table generation, active cursor tracking, and verification persistence

import { store } from './app.js';

export function autoTable(mode) {
  const inputsDef = mode.inputs || [];
  const n = inputsDef.length;
  const totalCombinations = 1 << n;

  const inHeaders = inputsDef.map(i => i.label);
  const outHeaders = [];

  const isExp01 = mode.reference !== undefined && mode.id !== 'half' && mode.id !== 'full';
  const isExp02 = mode.id === 'half' || mode.id === 'full';

  if (isExp01) {
    outHeaders.push('Y (NAND)', 'Y (native)', '=');
  } else if (isExp02) {
    if (mode.id === 'half') {
      outHeaders.push('Sum', 'Carry', 'Decimal');
    } else {
      outHeaders.push('Sum', 'Cout', 'Decimal');
    }
  } else {
    for (const out of mode.outputs || []) {
      outHeaders.push(out.label);
    }
  }

  const rows = [];
  for (let i = 0; i < totalCombinations; i++) {
    const inputObj = {};
    const ins = [];
    for (let bit = 0; bit < n; bit++) {
      // First input is MSB
      const val = (i >> (n - 1 - bit)) & 1;
      inputObj[inputsDef[bit].id] = val;
      ins.push(String(val));
    }

    const { nets } = mode.compute(inputObj);
    const outs = [];

    if (isExp01) {
      const nandVal = nets.Y;
      const refVal = mode.reference(inputObj).Y;
      const match = nandVal === refVal ? '✓' : '✗';
      outs.push(String(nandVal), String(refVal), match);
    } else if (isExp02) {
      if (mode.id === 'half') {
        const sum = nets.Sum;
        const carry = nets.Carry;
        const dec = inputObj.A + inputObj.B;
        outs.push(String(sum), String(carry), String(dec));
      } else {
        const sum = nets.Sum;
        const cout = nets.Cout;
        const dec = inputObj.A + inputObj.B + inputObj.Cin;
        outs.push(String(sum), String(cout), String(dec));
      }
    } else {
      for (const out of mode.outputs || []) {
        outs.push(String(nets[out.net] ?? 0));
      }
    }

    rows.push({ ins, outs });
  }

  return { inHeaders, outHeaders, rows };
}

export function createTruthTable(container, mode, { expId }) {
  const modeId = mode.id || 'default';
  const storageKey = `apexlogic.rows.${expId}.${modeId}`;

  // Get table definition (either manually provided or auto-generated)
  const tableData = mode.table || autoTable(mode);

  const totalRequired = tableData.validRowCount !== undefined ? tableData.validRowCount : tableData.rows.length;

  let visitedRows = new Set(store.get(storageKey, []));

  container.innerHTML = `
    <div class="verif-header-line">
      <span class="eyebrow">Truth Table</span>
      <span class="verif-stats-text" id="verif-stats-indicator">Rows tested 0/${totalRequired}</span>
    </div>
    <div class="table-scroll-container">
      <table class="logic-table">
        <thead>
          <tr>
            ${tableData.inHeaders.map((h, i) => `
              <th ${i === tableData.inHeaders.length - 1 ? 'class="divider-col"' : ''}>${h}</th>
            `).join('')}
            ${tableData.outHeaders.map(h => `<th>${h}</th>`).join('')}
            <th style="width: 24px;">✓</th>
          </tr>
        </thead>
        <tbody id="table-body">
          ${tableData.rows.map((r, rIdx) => {
            const isMuted = r.outs.some(val => val === '—');
            const isVisited = visitedRows.has(rIdx);
            return `
              <tr data-row-idx="${rIdx}" class="${isMuted ? 'row-muted' : ''}">
                ${r.ins.map((val, i) => `
                  <td ${i === r.ins.length - 1 ? 'class="divider-col"' : ''}>${val}</td>
                `).join('')}
                ${r.outs.map(val => `<td>${val}</td>`).join('')}
                <td class="cell-check">${isVisited ? '✓' : ''}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  const tbody = container.querySelector('#table-body');
  const statsEl = container.querySelector('#verif-stats-indicator');

  function renderStats() {
    let validVisitedCount = 0;
    if (tableData.validRowCount !== undefined) {
      for (const idx of visitedRows) {
        if (idx < tableData.validRowCount) validVisitedCount++;
      }
    } else {
      validVisitedCount = visitedRows.size;
    }

    const verified = validVisitedCount >= totalRequired;
    if (verified) {
      statsEl.className = 'verif-stats-text verified';
      statsEl.textContent = 'Verified ✓';
    } else {
      statsEl.className = 'verif-stats-text';
      statsEl.textContent = `Rows tested ${validVisitedCount}/${totalRequired}`;
    }
  }

  renderStats();

  return {
    update(inputs, runtime, isInitial = false) {
      const activeIdx = mode.rowKey(inputs, runtime);

      // Track visited unless initial load
      if (!isInitial && activeIdx >= 0 && activeIdx < tableData.rows.length) {
        if (!visitedRows.has(activeIdx)) {
          visitedRows.add(activeIdx);
          store.set(storageKey, Array.from(visitedRows));
        }
      }

      // Update rows UI
      const trs = tbody.querySelectorAll('tr');
      trs.forEach((tr, idx) => {
        const isActive = idx === activeIdx;
        tr.classList.toggle('active-row', isActive);
        const checkCell = tr.querySelector('.cell-check');
        if (checkCell) {
          checkCell.textContent = visitedRows.has(idx) ? '✓' : '';
        }
      });

      renderStats();
    },

    isVerified() {
      let count = 0;
      if (tableData.validRowCount !== undefined) {
        for (const idx of visitedRows) {
          if (idx < tableData.validRowCount) count++;
        }
      } else {
        count = visitedRows.size;
      }
      return count >= totalRequired;
    },

    stats() {
      let count = 0;
      if (tableData.validRowCount !== undefined) {
        for (const idx of visitedRows) {
          if (idx < tableData.validRowCount) count++;
        }
      } else {
        count = visitedRows.size;
      }
      return { visited: count, total: totalRequired };
    },

    resetVisited() {
      visitedRows.clear();
      store.remove(storageKey);
      renderStats();
      const trs = tbody.querySelectorAll('tr');
      trs.forEach(tr => {
        const checkCell = tr.querySelector('.cell-check');
        if (checkCell) checkCell.textContent = '';
      });
    }
  };
}
