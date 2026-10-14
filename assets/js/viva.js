// ApexLogic - viva.js
// Viva Voce quiz runner with locked feedback, score tally, and storage persistence

import { store } from './app.js';

export function renderViva(container, experiment) {
  const expId = experiment.id;
  const storageKey = `apexlogic.viva.${expId}`;

  const questions = experiment.viva || [];
  let state = store.get(storageKey, { answers: [null, null, null] });

  function calculateScore() {
    let score = 0;
    questions.forEach((q, idx) => {
      if (state.answers[idx] !== null && state.answers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  }

  function render() {
    const answeredCount = state.answers.filter(a => a !== null).length;
    const score = calculateScore();

    container.innerHTML = `
      <div class="manual-content">
        <div class="viva-header">
          <div class="viva-score">Viva Score: ${score} / ${questions.length}</div>
          ${answeredCount > 0 ? `<button type="button" class="btn btn-ghost" id="viva-retake-btn">Retake</button>` : ''}
        </div>
        <div class="viva-questions-list">
          ${questions.map((q, qIdx) => {
            const userAnswer = state.answers[qIdx];
            const isAnswered = userAnswer !== null;
            return `
              <div class="viva-card" data-q-idx="${qIdx}">
                <div class="eyebrow">Question 0${qIdx + 1}</div>
                <div class="viva-q-title">${q.question}</div>
                <div class="viva-options">
                  ${q.options.map((opt, optIdx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    let btnClass = 'viva-opt-btn';
                    let suffix = '';
                    if (isAnswered) {
                      if (optIdx === q.correctIndex) {
                        btnClass += ' opt-correct';
                        suffix = ' ✓';
                      } else if (optIdx === userAnswer) {
                        btnClass += ' opt-wrong';
                        suffix = ' ✗';
                      }
                    }
                    return `
                      <button type="button" class="${btnClass}" data-opt-idx="${optIdx}" ${isAnswered ? 'disabled' : ''}>
                        <span><strong class="mono">${letters[optIdx]}.</strong> ${opt}</span>
                        ${suffix ? `<span class="mono">${suffix}</span>` : ''}
                      </button>
                    `;
                  }).join('')}
                </div>
                ${isAnswered ? `<div class="viva-explanation">${q.explanation}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Attach retake listener
    const retakeBtn = container.querySelector('#viva-retake-btn');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        state = { answers: [null, null, null] };
        store.set(storageKey, state);
        render();
      });
    }

    // Attach option listeners
    const cards = container.querySelectorAll('.viva-card');
    cards.forEach(card => {
      const qIdx = parseInt(card.getAttribute('data-q-idx'), 10);
      const optBtns = card.querySelectorAll('.viva-opt-btn');
      optBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (state.answers[qIdx] !== null) return;
          const optIdx = parseInt(btn.getAttribute('data-opt-idx'), 10);
          state.answers[qIdx] = optIdx;
          store.set(storageKey, state);
          render();
        });
      });
    });
  }

  render();
}
