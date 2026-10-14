// ApexLogic - engine.js
// Netlist evaluation and Boolean gate primitives

export const GATES = {
  NOT:  a      => (a ? 0 : 1),
  AND:  (a, b) => (a & b),
  OR:   (a, b) => (a | b),
  XOR:  (a, b) => (a ^ b),
  NAND: (a, b) => ((a & b) ? 0 : 1),
  NOR:  (a, b) => ((a | b) ? 0 : 1),
};

/**
 * Netlist.components are in topological order.
 * Returns a map netName -> 0|1.
 */
export function evaluateNetlist(netlist, inputs) {
  const nets = { ...inputs };
  if (!netlist || !netlist.components) return nets;

  for (const c of netlist.components) {
    if (!c.type || (c.type !== 'BLOCK' && !GATES[c.type])) {
      // Skip non-gate / non-block components such as SEG7
      continue;
    }
    const ins = (c.in || []).map(n => (nets[n] !== undefined ? nets[n] : 0));
    if (c.type === 'BLOCK') {
      if (typeof c.fn === 'function') {
        const blockOuts = c.fn(ins);
        Object.assign(nets, blockOuts);
      }
    } else {
      nets[c.out] = GATES[c.type](...ins);
    }
  }
  return nets;
}
