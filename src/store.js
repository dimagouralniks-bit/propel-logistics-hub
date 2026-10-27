import { useEffect, useState, useCallback } from 'react';
import { seed } from './data';
const KEY = 'propel-hub-demo-v1';
const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.items) return s; } catch {} return seed(); };
export function useStore() {
  const [state, setState] = useState(load);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);
  const update = useCallback((fn) => setState((s) => { const n = JSON.parse(JSON.stringify(s)); fn(n); return n; }), []);
  const reset = () => setState(seed());
  return [state, update, reset];
}
export const now = () => new Date().toISOString();
export const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();
export const totalQty = (item) => item.stock.reduce((a, b) => a + b.qty, 0);
export const fmtMoney = (n) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
export const fmtTime = (iso) => new Date(iso).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
