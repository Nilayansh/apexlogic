// ApexLogic - probe.js
// Interactive logic probe tool for inspecting node states

export function createProbe(canvasCardEl, toggleBtnEl, getNets) {
  let isProbing = false;

  // Create popover element
  let popover = canvasCardEl.querySelector('.probe-popover');
  if (!popover) {
    popover = document.createElement('div');
    popover.className = 'probe-popover';
    canvasCardEl.appendChild(popover);
  }

  function setProbing(enabled) {
    isProbing = enabled;
    toggleBtnEl.setAttribute('aria-pressed', isProbing ? 'true' : 'false');
    canvasCardEl.classList.toggle('probing', isProbing);
    if (!isProbing) {
      popover.style.display = 'none';
    }
  }

  toggleBtnEl.addEventListener('click', () => {
    setProbing(!isProbing);
  });

  function updatePopover(e, targetEl) {
    if (!isProbing) return;
    const net = targetEl.getAttribute('data-net');
    if (!net) return;

    const nets = getNets();
    const val = nets[net] ?? 0;
    const isHigh = val === 1;

    popover.innerHTML = `
      <div>Node: NET_${net.toUpperCase()}</div>
      <div>Voltage: ${isHigh ? '+5.0 V (HIGH)' : '0.0 V (LOW)'}</div>
      <div>Binary State: ${val}</div>
    `;
    popover.style.display = 'block';

    const cardRect = canvasCardEl.getBoundingClientRect();
    let left = e.clientX - cardRect.left + 12;
    let top = e.clientY - cardRect.top + 12;

    // Clamp inside canvas card
    const popWidth = 180;
    const popHeight = 70;
    if (left + popWidth > cardRect.width - 10) {
      left = left - popWidth - 24;
    }
    if (top + popHeight > cardRect.height - 10) {
      top = top - popHeight - 24;
    }

    popover.style.left = `${Math.max(8, left)}px`;
    popover.style.top = `${Math.max(8, top)}px`;
  }

  canvasCardEl.addEventListener('pointermove', (e) => {
    if (!isProbing) return;
    const target = e.target.closest('[data-net]');
    if (target) {
      updatePopover(e, target);
    } else {
      popover.style.display = 'none';
    }
  });

  canvasCardEl.addEventListener('pointerdown', (e) => {
    if (!isProbing) return;
    const target = e.target.closest('[data-net]');
    if (target) {
      updatePopover(e, target);
    } else {
      popover.style.display = 'none';
    }
  });

  return {
    destroy() {
      setProbing(false);
      popover.remove();
    }
  };
}
