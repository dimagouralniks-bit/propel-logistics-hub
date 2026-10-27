import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Boxes, PackageOpen, Truck, ClipboardList, Users, SlidersHorizontal, Search, Plus, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Check, X, Menu, RotateCcw, Pencil, Scale } from 'lucide-react';
import { WAREHOUSES, CARRIERS, CLIENTS } from './data';
import { useStore, now, isToday, totalQty, fmtMoney, fmtTime } from './store';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'receiving', label: 'Receiving', icon: PackageOpen, module: 'receiving' },
  { id: 'dispatch', label: 'Dispatch', icon: Truck, module: 'dispatch' },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'clients', label: 'Clients', icon: Users, module: 'clients' },
  { id: 'customise', label: 'Customise', icon: SlidersHorizontal },
];
const ORDER_STEPS = ['new', 'picked', 'packed', 'shipped', 'delivered'];
const ORDER_LABEL = { new: 'Awaiting pick', picked: 'Picked', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered' };
const ORDER_NEXT = { new: 'Mark picked', picked: 'Mark packed', packed: 'Ship it', shipped: 'Mark delivered' };
const ASN_STEPS = ['expected', 'arrived', 'checked', 'putaway'];
const ASN_LABEL = { expected: 'Expected', arrived: 'Arrived', checked: 'Checked', putaway: 'Put away' };
const ASN_NEXT = { expected: 'Mark arrived', arrived: 'Check quantities', checked: 'Put away to bins' };
const clientName = (id) => CLIENTS.find((c) => c.id === id)?.name || 'Company stock';
const whName = (id) => WAREHOUSES.find((w) => w.id === id)?.name || id;

function useHash() {
  const get = () => (window.location.hash.replace('#/', '').split('?')[0] || 'dashboard');
  const [page, setPage] = useState(get);
  useEffect(() => { const f = () => setPage(get()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  return page;
}

export default function App() {
  const [state, update, reset] = useStore();
  const page = useHash();
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState('');
  const notify = (m) => { setToast(m); clearTimeout(window.__t); window.__t = setTimeout(() => setToast(''), 2600); };
  const mods = Object.fromEntries(state.modules.map((m) => [m.id, m.on]));
  const nav = NAV.filter((n) => !n.module || mods[n.module]);
  const current = nav.find((n) => n.id === page) ? page : 'dashboard';
  const props = { state, update, notify, mods };
  useEffect(() => { setMenu(false); window.scrollTo(0, 0); }, [page]);
  return (
    <div className="shell">
      <aside className={`sidebar ${menu ? 'open' : ''}`}>
        <div className="brand"><span className="mark">P</span><span>Propel<small>Logistics Hub</small></span></div>
        <nav>{nav.map((n) => <a key={n.id} href={`#/${n.id}`} className={current === n.id ? 'active' : ''}><n.icon size={18} />{n.label}</a>)}</nav>
        <div className="side-foot">
          <div className="demo-pill">DEMO DATA ONLY</div>
          <button className="ghost-light" onClick={() => { if (confirm('Reset all demo data to the starting example?')) { reset(); notify('Demo data reset'); } }}><RotateCcw size={14} /> Reset demo data</button>
        </div>
      </aside>
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}
      <main>
        <header className="topbar">
          <button className="menu-btn" aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu(!menu)}><Menu size={20} /></button>
          <div className="crumb">Propel Logistics Hub / <b>{NAV.find((n) => n.id === current).label}</b></div>
          <span className="demo-banner">MVP preview · fictional example data</span>
        </header>
        <div className="page">
          {current === 'dashboard' && <Dashboard {...props} />}
          {current === 'inventory' && <Inventory {...props} />}
          {current === 'receiving' && <Receiving {...props} />}
          {current === 'dispatch' && <Dispatch {...props} />}
          {current === 'orders' && <Orders {...props} />}
          {current === 'clients' && <Clients {...props} />}
          {current === 'customise' && <Customise {...props} />}
        </div>
        <footer className="foot">Propel Logistics Hub · MVP concept adapted from Warevolve · all names, SKUs and records are fictional demo data · saved in this browser only</footer>
      </main>
      <nav className="tabbar">{nav.slice(0, 5).map((n) => <a key={n.id} href={`#/${n.id}`} className={current === n.id ? 'active' : ''}><n.icon size={20} /><span>{n.label}</span></a>)}</nav>
      {toast && <div className="toast" role="status"><Check size={16} /> {toast}</div>}
    </div>
  );
}

function Head({ kicker, title, sub, children }) {
  return <div className="head"><div><div className="kicker">{kicker}</div><h1>{title}</h1>{sub && <p className="muted">{sub}</p>}</div><div className="head-actions">{children}</div></div>;
}
function Modal({ title, onClose, children }) {
  useEffect(() => { const f = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f); }, [onClose]);
  return <div className="modal-bg" onClick={onClose}><div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button className="icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button></div>{children}</div></div>;
}
const Badge = ({ s }) => <span className={`badge b-${s}`}>{ORDER_LABEL[s] || ASN_LABEL[s] || s}</span>;
function Steps({ steps, labels, current }) {
  const idx = steps.indexOf(current);
  return <div className="steps">{steps.map((s, i) => <div key={s} className={`step ${i <= idx ? 'done' : ''} ${i === idx ? 'cur' : ''}`}><span className="dot">{i < idx || (i === idx && i === steps.length - 1) ? <Check size={12} /> : i + 1}</span><span>{labels[s]}</span></div>)}</div>;
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ state, mods }) {
  const value = state.items.reduce((a, i) => a + totalQty(i) * i.unitValue, 0);
  const units = state.items.reduce((a, i) => a + totalQty(i), 0);
  const low = state.items.filter((i) => totalQty(i) <= i.reorder);
  const inToday = state.movements.filter((m) => m.type === 'in' && isToday(m.at)).reduce((a, m) => a + m.qty, 0);
  const outToday = state.movements.filter((m) => m.type === 'out' && isToday(m.at)).reduce((a, m) => a + m.qty, 0);
  const awaiting = state.orders.filter((o) => ['new', 'picked', 'packed'].includes(o.status));
  const expected = state.inbound.filter((a) => a.status !== 'putaway');
  const byWh = WAREHOUSES.map((w) => ({ name: w.short, units: state.items.reduce((a, i) => a + i.stock.filter((s) => s.wh === w.id).reduce((x, s) => x + s.qty, 0), 0) }));
  const byClient = CLIENTS.map((c) => ({ name: c.name.replace(' (demo)', ''), value: state.items.filter((i) => i.client === c.id).reduce((a, i) => a + totalQty(i) * i.unitValue, 0), colour: c.colour }));
  const pipeline = ORDER_STEPS.slice(0, 4).map((s) => ({ name: ORDER_LABEL[s], orders: state.orders.filter((o) => o.status === s).length }));
  return <>
    <Head kicker="PROPEL OPERATIONS" title="Today at a glance" sub="Stock, inbound and outbound across all demo warehouses." >
      <a className="btn primary big" href="#/dispatch"><Truck size={18} /> Dispatch queue</a>
      <a className="btn big" href="#/receiving"><PackageOpen size={18} /> Receive goods</a>
    </Head>
    <div className="kpis">
      <Kpi label="Stock value" value={fmtMoney(value)} note={`${units.toLocaleString()} units on hand`} />
      <Kpi label="Low-stock alerts" value={mods.alerts ? low.length : '—'} note="At or below reorder point" tone={low.length && mods.alerts ? 'warn' : ''} href="#/inventory?low" />
      <Kpi label="Inbound today" value={inToday} note={`${expected.length} deliveries still open`} icon={ArrowDownToLine} />
      <Kpi label="Outbound today" value={outToday} note="Units shipped today" icon={ArrowUpFromLine} />
      <Kpi label="Awaiting dispatch" value={awaiting.length} note="Orders not yet shipped" tone={awaiting.length ? 'accent' : ''} href="#/dispatch" />
    </div>
    <div className="grid3">
      <div className="card"><h3>Order pipeline</h3><div className="chart"><ResponsiveContainer><BarChart data={pipeline}><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} width={24} /><Tooltip /><Bar isAnimationActive={false} dataKey="orders" fill="#dc6035" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      <div className="card"><h3>Units by warehouse</h3><div className="chart"><ResponsiveContainer><BarChart data={byWh}><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} width={36} /><Tooltip /><Bar isAnimationActive={false} dataKey="units" fill="#2a7161" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      <div className="card"><h3>Stock value by client</h3><div className="chart"><ResponsiveContainer><PieChart><Pie isAnimationActive={false} data={byClient} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>{byClient.map((c) => <Cell key={c.name} fill={c.colour} />)}</Pie><Tooltip formatter={(v) => fmtMoney(v)} /></PieChart></ResponsiveContainer></div><div className="legend">{byClient.map((c) => <span key={c.name}><i style={{ background: c.colour }} />{c.name}</span>)}</div></div>
    </div>
    <div className="grid2">
      {mods.alerts && <div className="card"><h3><AlertTriangle size={16} className="warn-ic" /> Low stock</h3>{low.length === 0 ? <p className="muted">All SKUs above reorder point.</p> : <table><thead><tr><th>SKU</th><th>On hand</th><th>Reorder at</th></tr></thead><tbody>{low.map((i) => <tr key={i.sku}><td><b>{i.sku}</b><div className="muted sm">{i.name}</div></td><td className="warn-txt">{totalQty(i)}</td><td>{i.reorder}</td></tr>)}</tbody></table>}</div>}
      <div className="card"><h3>Recent stock movements</h3><ul className="feed">{[...state.movements].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6).map((m, k) => <li key={k}><span className={`mv ${m.type}`}>{m.type === 'in' ? '+' : '−'}{m.qty}</span><div><b>{m.sku}</b> · {m.ref}<div className="muted sm">{whName(m.wh)} · {fmtTime(m.at)}</div></div></li>)}</ul></div>
    </div>
  </>;
}
function Kpi({ label, value, note, tone, href, icon: Icon }) {
  const body = <><div className="kpi-label">{Icon && <Icon size={14} />} {label}</div><div className="kpi-val">{value}</div><div className="muted sm">{note}</div></>;
  return href ? <a href={href} className={`kpi ${tone || ''}`}>{body}</a> : <div className={`kpi ${tone || ''}`}>{body}</div>;
}

/* ---------------- Inventory ---------------- */
function Inventory({ state, update, notify }) {
  const [q, setQ] = useState('');
  const [wh, setWh] = useState('all');
  const [cl, setCl] = useState('all');
  const [lowOnly, setLowOnly] = useState(window.location.hash.includes('low'));
  const [edit, setEdit] = useState(null);
  const [adjust, setAdjust] = useState(null);
  const rows = state.items.filter((i) => (q === '' || (i.sku + i.name).toLowerCase().includes(q.toLowerCase()) || i.stock.some((s) => s.bin.toLowerCase().includes(q.toLowerCase())))
    && (wh === 'all' || i.stock.some((s) => s.wh === wh)) && (cl === 'all' || i.client === cl) && (!lowOnly || totalQty(i) <= i.reorder));
  return <>
    <Head kicker="STOCK" title="Inventory" sub="Every SKU, where it sits, and when to reorder.">
      <button className="btn primary big" onClick={() => setEdit({ isNew: true, sku: '', name: '', client: 'C1', unitValue: 0, reorder: 10, uom: 'unit', stock: [{ wh: 'WH-A', bin: '', qty: 0 }] })}><Plus size={18} /> Add item</button>
    </Head>
    <div className="filters card">
      <label className="search"><Search size={16} /><input placeholder="Search SKU, name or bin…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      <select value={wh} onChange={(e) => setWh(e.target.value)} aria-label="Warehouse"><option value="all">All warehouses</option>{WAREHOUSES.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
      <select value={cl} onChange={(e) => setCl(e.target.value)} aria-label="Client"><option value="all">All clients</option>{CLIENTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <label className="chk"><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Low stock only</label>
    </div>
    <div className="card table-card">
      <table className="inv"><thead><tr><th>SKU / item</th><th>Client</th><th>Locations (warehouse · bin · qty)</th><th>On hand</th><th>Reorder</th><th>Value</th><th></th></tr></thead>
        <tbody>{rows.map((i) => { const t = totalQty(i); return <tr key={i.sku}>
          <td data-l="Item"><b>{i.sku}</b><div className="muted sm">{i.name}</div></td>
          <td data-l="Client" className="sm">{clientName(i.client)}</td>
          <td data-l="Locations">{i.stock.map((s, k) => <span key={k} className="loc">{s.wh} · {s.bin || '—'} · <b>{s.qty}</b></span>)}</td>
          <td data-l="On hand" className={t <= i.reorder ? 'warn-txt' : ''}><b>{t}</b> {i.uom}{t <= i.reorder && <span className="badge b-low">Low</span>}</td>
          <td data-l="Reorder">{i.reorder}</td>
          <td data-l="Value">{fmtMoney(t * i.unitValue)}</td>
          <td className="row-act"><button className="btn" onClick={() => setAdjust({ sku: i.sku, idx: 0, delta: 0, reason: 'Stocktake count' })}><Scale size={15} /> Adjust</button><button className="btn" onClick={() => setEdit({ ...JSON.parse(JSON.stringify(i)) })}><Pencil size={15} /> Edit</button></td>
        </tr>; })}</tbody></table>
      {rows.length === 0 && <p className="muted pad">No items match these filters.</p>}
    </div>
    {edit && <ItemForm item={edit} onClose={() => setEdit(null)} onSave={(it) => {
      if (!it.sku.trim() || !it.name.trim()) return alert('SKU and name are required.');
      if (edit.isNew && state.items.some((x) => x.sku === it.sku)) return alert('That SKU already exists.');
      update((s) => { const { isNew, ...clean } = it; const k = s.items.findIndex((x) => x.sku === edit.sku); if (edit.isNew || k < 0) s.items.unshift(clean); else s.items[k] = clean; });
      setEdit(null); notify(edit.isNew ? `Added ${it.sku}` : `Saved ${it.sku}`);
    }} />}
    {adjust && (() => { const item = state.items.find((x) => x.sku === adjust.sku); return <Modal title={`Adjust stock · ${item.sku}`} onClose={() => setAdjust(null)}>
      <div className="form">
        <label>Location<select value={adjust.idx} onChange={(e) => setAdjust({ ...adjust, idx: +e.target.value })}>{item.stock.map((s, k) => <option key={k} value={k}>{s.wh} · {s.bin} (now {s.qty})</option>)}</select></label>
        <div className="stepper"><button className="btn big" onClick={() => setAdjust({ ...adjust, delta: adjust.delta - 1 })}>−1</button><input type="number" value={adjust.delta} onChange={(e) => setAdjust({ ...adjust, delta: parseInt(e.target.value || 0) })} aria-label="Change" /><button className="btn big" onClick={() => setAdjust({ ...adjust, delta: adjust.delta + 1 })}>+1</button></div>
        <p className="muted sm">New quantity: <b>{Math.max(0, item.stock[adjust.idx].qty + adjust.delta)}</b></p>
        <label>Reason<select value={adjust.reason} onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })}>{['Stocktake count', 'Damaged', 'Found stock', 'Returned to stock', 'Other'].map((r) => <option key={r}>{r}</option>)}</select></label>
        <button className="btn primary big full" disabled={!adjust.delta} onClick={() => { update((s) => { const it = s.items.find((x) => x.sku === adjust.sku); const loc = it.stock[adjust.idx]; const d = Math.max(-loc.qty, adjust.delta); loc.qty += d; s.movements.push({ at: now(), type: d > 0 ? 'adj+' : 'adj-', sku: it.sku, qty: Math.abs(d), wh: loc.wh, ref: adjust.reason }); }); notify(`Stock adjusted (${adjust.delta > 0 ? '+' : ''}${adjust.delta})`); setAdjust(null); }}>Save adjustment</button>
      </div></Modal>; })()}
  </>;
}
function ItemForm({ item, onClose, onSave }) {
  const [f, setF] = useState(item);
  const set = (k, v) => setF({ ...f, [k]: v });
  const setLoc = (k, key, v) => { const stock = f.stock.map((s, i) => i === k ? { ...s, [key]: v } : s); setF({ ...f, stock }); };
  return <Modal title={item.isNew ? 'Add item' : `Edit ${item.sku}`} onClose={onClose}><div className="form">
    <div className="row2"><label>SKU<input value={f.sku} disabled={!item.isNew} onChange={(e) => set('sku', e.target.value.toUpperCase())} /></label><label>Name<input value={f.name} onChange={(e) => set('name', e.target.value)} /></label></div>
    <div className="row2"><label>Client (stock owner)<select value={f.client} onChange={(e) => set('client', e.target.value)}>{CLIENTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Unit<select value={f.uom} onChange={(e) => set('uom', e.target.value)}>{['unit', 'carton', 'pallet'].map((u) => <option key={u}>{u}</option>)}</select></label></div>
    <div className="row2"><label>Unit value (AUD)<input type="number" value={f.unitValue} onChange={(e) => set('unitValue', +e.target.value)} /></label><label>Reorder point<input type="number" value={f.reorder} onChange={(e) => set('reorder', +e.target.value)} /></label></div>
    <div className="sub">Locations</div>
    {f.stock.map((s, k) => <div className="row3" key={k}><select value={s.wh} onChange={(e) => setLoc(k, 'wh', e.target.value)} aria-label="Warehouse">{WAREHOUSES.map((w) => <option key={w.id} value={w.id}>{w.short}</option>)}</select><input placeholder="Bin e.g. A-01-02" value={s.bin} onChange={(e) => setLoc(k, 'bin', e.target.value.toUpperCase())} aria-label="Bin" /><input type="number" value={s.qty} onChange={(e) => setLoc(k, 'qty', Math.max(0, +e.target.value))} aria-label="Quantity" /></div>)}
    <button className="btn" onClick={() => setF({ ...f, stock: [...f.stock, { wh: 'WH-A', bin: '', qty: 0 }] })}><Plus size={14} /> Add location</button>
    <button className="btn primary big full" onClick={() => onSave(f)}>Save item</button>
  </div></Modal>;
}

/* ---------------- Receiving ---------------- */
function Receiving({ state, update, notify }) {
  const [show, setShow] = useState(false);
  const open = state.inbound.filter((a) => a.status !== 'putaway').sort((a, b) => a.eta.localeCompare(b.eta));
  const done = state.inbound.filter((a) => a.status === 'putaway');
  const advance = (a) => {
    const nxt = ASN_STEPS[ASN_STEPS.indexOf(a.status) + 1];
    update((s) => { const x = s.inbound.find((y) => y.id === a.id); x.status = nxt; x.timeline.push({ status: nxt, at: now() });
      if (nxt === 'putaway') x.lines.forEach((l) => { let item = s.items.find((i) => i.sku === l.sku); if (!item) return; let loc = item.stock.find((st) => st.wh === x.wh && st.bin === l.bin) || item.stock.find((st) => st.wh === x.wh); if (!loc) { loc = { wh: x.wh, bin: l.bin || 'RECV', qty: 0 }; item.stock.push(loc); } loc.qty += l.qty; s.movements.push({ at: now(), type: 'in', sku: l.sku, qty: l.qty, wh: x.wh, ref: x.id }); }); });
    notify(`${a.id}: ${ASN_LABEL[nxt]}${nxt === 'putaway' ? ' — stock updated' : ''}`);
  };
  return <>
    <Head kicker="INBOUND" title="Receiving" sub="Tap one button per step: arrived → checked → put away. Stock updates on put-away.">
      <button className="btn primary big" onClick={() => setShow(true)}><Plus size={18} /> New inbound delivery</button>
    </Head>
    <div className="cards">{open.map((a) => <div className="card op" key={a.id}>
      <div className="op-top"><div><b className="op-id">{a.id}</b> <Badge s={a.status} /><div className="muted sm">{clientName(a.client)} · {a.supplier}</div></div><div className="sm right">ETA {fmtTime(a.eta)}<div className="muted">{whName(a.wh)}</div></div></div>
      <Steps steps={ASN_STEPS} labels={ASN_LABEL} current={a.status} />
      <ul className="lines">{a.lines.map((l, k) => <li key={k}><b>{l.qty}×</b> {l.sku} → bin {l.bin || '—'}</li>)}</ul>
      <button className="btn primary huge" onClick={() => advance(a)}><Check size={20} /> {ASN_NEXT[a.status]}</button>
    </div>)}{open.length === 0 && <div className="card"><p className="muted">No open inbound deliveries. Create one to try the flow.</p></div>}</div>
    <div className="card"><h3>Completed today & earlier</h3><table><thead><tr><th>Delivery</th><th>Client</th><th>Lines</th><th>Put away</th></tr></thead><tbody>{done.map((a) => <tr key={a.id}><td><b>{a.id}</b></td><td className="sm">{clientName(a.client)}</td><td className="sm">{a.lines.map((l) => `${l.qty}× ${l.sku}`).join(', ')}</td><td className="sm">{fmtTime(a.timeline.at(-1).at)}</td></tr>)}</tbody></table></div>
    {show && <NewAsn state={state} onClose={() => setShow(false)} onSave={(a) => { update((s) => { s.inbound.push({ ...a, id: `ASN-${s.nextAsn}`, status: 'expected', timeline: [{ status: 'expected', at: now() }] }); s.nextAsn++; }); setShow(false); notify('Inbound delivery created'); }} />}
  </>;
}
function NewAsn({ state, onClose, onSave }) {
  const [f, setF] = useState({ client: 'C1', supplier: 'Demo Supplier', wh: 'WH-A', eta: new Date().toISOString().slice(0, 16), sku: '', qty: 10, bin: '' });
  const skus = state.items.filter((i) => i.client === f.client);
  const sku = f.sku || skus[0]?.sku;
  return <Modal title="New inbound delivery" onClose={onClose}><div className="form">
    <div className="row2"><label>Client<select value={f.client} onChange={(e) => setF({ ...f, client: e.target.value, sku: '' })}>{CLIENTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Supplier<input value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} /></label></div>
    <div className="row2"><label>Warehouse<select value={f.wh} onChange={(e) => setF({ ...f, wh: e.target.value })}>{WAREHOUSES.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label><label>ETA<input type="datetime-local" value={f.eta} onChange={(e) => setF({ ...f, eta: e.target.value })} /></label></div>
    <div className="row3"><select value={sku} onChange={(e) => setF({ ...f, sku: e.target.value })} aria-label="SKU">{skus.map((i) => <option key={i.sku} value={i.sku}>{i.sku}</option>)}</select><input type="number" value={f.qty} onChange={(e) => setF({ ...f, qty: Math.max(1, +e.target.value) })} aria-label="Quantity" /><input placeholder="Bin" value={f.bin} onChange={(e) => setF({ ...f, bin: e.target.value.toUpperCase() })} aria-label="Bin" /></div>
    <button className="btn primary big full" disabled={!sku} onClick={() => onSave({ client: f.client, supplier: f.supplier, wh: f.wh, eta: new Date(f.eta).toISOString(), lines: [{ sku, qty: f.qty, bin: f.bin }] })}>Create delivery</button>
  </div></Modal>;
}

/* ---------------- Dispatch ---------------- */
function advanceOrder(update, notify, o, extra = {}) {
  const nxt = ORDER_STEPS[ORDER_STEPS.indexOf(o.status) + 1];
  let short = null;
  update((s) => { const x = s.orders.find((y) => y.id === o.id); Object.assign(x, extra);
    if (nxt === 'picked') { x.lines.forEach((l) => { const it = s.items.find((i) => i.sku === l.sku); if (!it) return; let need = l.qty; const locs = [...it.stock.filter((st) => st.wh === x.wh), ...it.stock.filter((st) => st.wh !== x.wh)]; for (const loc of locs) { const take = Math.min(loc.qty, need); loc.qty -= take; need -= take; if (!need) break; } if (need) short = `${l.sku} short by ${need}`; s.movements.push({ at: now(), type: 'out', sku: l.sku, qty: l.qty - need, wh: x.wh, ref: x.id }); }); }
    if (nxt === 'shipped' && !x.tracking) x.tracking = `${x.carrier.split(' ').map((w) => w[0]).join('').toUpperCase()}-${Math.floor(100000 + Math.random() * 899999)}`;
    x.status = nxt; x.timeline.push({ status: nxt, at: now() }); });
  notify(short ? `${o.id} picked — warning: ${short}` : `${o.id}: ${ORDER_LABEL[nxt]}`);
}
function Dispatch({ state, update, notify }) {
  const [ship, setShip] = useState(null);
  const queue = state.orders.filter((o) => ['new', 'picked', 'packed'].includes(o.status));
  const cols = ['new', 'picked', 'packed'];
  return <>
    <Head kicker="OUTBOUND" title="Dispatch" sub="Pick → pack → ship. One big button per step; stock leaves the shelf when picked." >
      <a className="btn big" href="#/orders"><Plus size={18} /> New order</a>
    </Head>
    <div className="kanban">{cols.map((c) => <div className="col" key={c}><div className="col-head">{ORDER_LABEL[c]} <span>{queue.filter((o) => o.status === c).length}</span></div>
      {queue.filter((o) => o.status === c).map((o) => <div className="card op" key={o.id}>
        <div className="op-top"><div><b className="op-id">{o.id}</b><div className="muted sm">{o.customer}</div></div><span className="sm muted">{o.wh}</span></div>
        <ul className="lines">{o.lines.map((l, k) => { const it = state.items.find((i) => i.sku === l.sku); const bin = it?.stock.find((s) => s.wh === o.wh)?.bin; return <li key={k}><b>{l.qty}×</b> {l.sku} {o.status === 'new' && bin && <span className="loc">bin {bin}</span>}</li>; })}</ul>
        <div className="sm muted">{o.carrier} · {clientName(o.client)}</div>
        <button className="btn primary huge" onClick={() => o.status === 'packed' ? setShip({ ...o }) : advanceOrder(update, notify, o)}>{o.status === 'packed' ? <Truck size={20} /> : <Check size={20} />} {ORDER_NEXT[o.status]}</button>
      </div>)}
    </div>)}</div>
    {ship && <Modal title={`Ship ${ship.id}`} onClose={() => setShip(null)}><div className="form">
      <label>Carrier<select value={ship.carrier} onChange={(e) => setShip({ ...ship, carrier: e.target.value })}>{CARRIERS.map((c) => <option key={c}>{c}</option>)}</select></label>
      <label>Tracking / consignment ref<input placeholder="Leave blank to auto-generate a demo ref" value={ship.tracking} onChange={(e) => setShip({ ...ship, tracking: e.target.value })} /></label>
      <p className="muted sm">Live carrier booking and label printing are a “coming soon” module (see Customise).</p>
      <button className="btn primary big full" onClick={() => { advanceOrder(update, notify, ship, { carrier: ship.carrier, tracking: ship.tracking }); setShip(null); }}><Truck size={18} /> Confirm shipped</button>
    </div></Modal>}
  </>;
}

/* ---------------- Orders ---------------- */
function Orders({ state, update, notify }) {
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState('all');
  const rows = [...state.orders].reverse().filter((o) => filter === 'all' || o.status === filter);
  const o = sel && state.orders.find((x) => x.id === sel);
  return <>
    <Head kicker="CONSIGNMENTS" title="Orders" sub="Every order with its carrier, tracking reference and status timeline.">
      <button className="btn primary big" onClick={() => setShow(true)}><Plus size={18} /> New order</button>
    </Head>
    <div className="chips">{['all', ...ORDER_STEPS].map((s) => <button key={s} className={`chip ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>{s === 'all' ? 'All' : ORDER_LABEL[s]} <span>{s === 'all' ? state.orders.length : state.orders.filter((x) => x.status === s).length}</span></button>)}</div>
    <div className="card table-card"><table className="inv"><thead><tr><th>Order</th><th>Client / customer</th><th>Carrier</th><th>Tracking</th><th>Status</th><th></th></tr></thead><tbody>
      {rows.map((x) => <tr key={x.id}><td data-l="Order"><b>{x.id}</b><div className="muted sm">{fmtTime(x.timeline[0].at)}</div></td><td data-l="Customer" className="sm">{x.customer}<div className="muted">{clientName(x.client)}</div></td><td data-l="Carrier" className="sm">{x.carrier}</td><td data-l="Tracking" className="sm mono">{x.tracking || '—'}</td><td data-l="Status"><Badge s={x.status} /></td><td className="row-act"><button className="btn" onClick={() => setSel(x.id)}>Open</button></td></tr>)}
    </tbody></table></div>
    {o && <Modal title={`${o.id} · ${o.customer}`} onClose={() => setSel(null)}>
      <Steps steps={ORDER_STEPS} labels={ORDER_LABEL} current={o.status} />
      <div className="detail"><div><span className="muted sm">Client</span><div>{clientName(o.client)}</div></div><div><span className="muted sm">Warehouse</span><div>{whName(o.wh)}</div></div><div><span className="muted sm">Carrier</span><div>{o.carrier}</div></div><div><span className="muted sm">Tracking ref</span><div className="mono">{o.tracking || 'Assigned when shipped'}</div></div></div>
      <ul className="lines">{o.lines.map((l, k) => <li key={k}><b>{l.qty}×</b> {l.sku}</li>)}</ul>
      <div className="sub">Status timeline</div>
      <ol className="timeline">{o.timeline.map((t, k) => <li key={k}><b>{ORDER_LABEL[t.status]}</b> <span className="muted sm">{fmtTime(t.at)}</span></li>)}</ol>
      {ORDER_NEXT[o.status] && <button className="btn primary big full" onClick={() => advanceOrder(update, notify, o)}><Check size={18} /> {ORDER_NEXT[o.status]}</button>}
    </Modal>}
    {show && <NewOrder state={state} onClose={() => setShow(false)} onSave={(n) => { update((s) => { s.orders.push({ ...n, id: `ORD-${s.nextOrder}`, status: 'new', tracking: '', timeline: [{ status: 'new', at: now() }] }); s.nextOrder++; }); setShow(false); notify('Order created — now in the dispatch queue'); }} />}
  </>;
}
function NewOrder({ state, onClose, onSave }) {
  const [f, setF] = useState({ client: 'C1', customer: 'Demo Customer', wh: 'WH-A', carrier: CARRIERS[0], sku: '', qty: 1 });
  const skus = state.items.filter((i) => i.client === f.client);
  const sku = f.sku || skus[0]?.sku;
  return <Modal title="New order" onClose={onClose}><div className="form">
    <div className="row2"><label>Client<select value={f.client} onChange={(e) => setF({ ...f, client: e.target.value, sku: '' })}>{CLIENTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Ship to (customer)<input value={f.customer} onChange={(e) => setF({ ...f, customer: e.target.value })} /></label></div>
    <div className="row2"><label>Ship from<select value={f.wh} onChange={(e) => setF({ ...f, wh: e.target.value })}>{WAREHOUSES.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label><label>Carrier<select value={f.carrier} onChange={(e) => setF({ ...f, carrier: e.target.value })}>{CARRIERS.map((c) => <option key={c}>{c}</option>)}</select></label></div>
    <div className="row2"><label>SKU<select value={sku} onChange={(e) => setF({ ...f, sku: e.target.value })}>{skus.map((i) => <option key={i.sku} value={i.sku}>{i.sku} ({totalQty(i)} on hand)</option>)}</select></label><label>Qty<input type="number" value={f.qty} onChange={(e) => setF({ ...f, qty: Math.max(1, +e.target.value) })} /></label></div>
    <button className="btn primary big full" disabled={!sku} onClick={() => onSave({ client: f.client, customer: f.customer, wh: f.wh, carrier: f.carrier, lines: [{ sku, qty: f.qty }] })}>Create order</button>
  </div></Modal>;
}

/* ---------------- Clients ---------------- */
function Clients({ state }) {
  return <>
    <Head kicker="3PL" title="Clients" sub="Stock held for each client, with open orders and inbound deliveries." />
    <div className="cards">{CLIENTS.map((c) => { const items = state.items.filter((i) => i.client === c.id); const units = items.reduce((a, i) => a + totalQty(i), 0); const val = items.reduce((a, i) => a + totalQty(i) * i.unitValue, 0);
      return <div className="card client" key={c.id} style={{ borderTop: `4px solid ${c.colour}` }}>
        <h3>{c.name}</h3><div className="muted sm">{c.contact} · Billing: {c.billing}</div>
        <div className="mini-kpis"><div><b>{items.length}</b><span>SKUs</span></div><div><b>{units.toLocaleString()}</b><span>units held</span></div><div><b>{fmtMoney(val)}</b><span>stock value</span></div><div><b>{state.orders.filter((o) => o.client === c.id && o.status !== 'delivered').length}</b><span>open orders</span></div><div><b>{state.inbound.filter((a) => a.client === c.id && a.status !== 'putaway').length}</b><span>inbound</span></div></div>
        <table><tbody>{items.map((i) => <tr key={i.sku}><td><b>{i.sku}</b> <span className="muted sm">{i.name}</span></td><td className={`right ${totalQty(i) <= i.reorder ? 'warn-txt' : ''}`}>{totalQty(i)}</td></tr>)}</tbody></table>
      </div>; })}</div>
  </>;
}

/* ---------------- Customise ---------------- */
function Customise({ state, update, notify }) {
  const built = state.modules.filter((m) => m.built), soon = state.modules.filter((m) => !m.built);
  const toggle = (m) => { update((s) => { const x = s.modules.find((y) => y.id === m.id); x.on = !x.on; }); notify(m.built ? `${m.name} ${m.on ? 'hidden' : 'switched on'}` : `${m.name} ${m.on ? 'removed from' : 'added to'} wishlist`); };
  return <>
    <Head kicker="TAILOR IT" title="Customise your hub" sub="Switch modules on or off to fit how your operation runs. Built modules work now; others are on the roadmap." />
    <div className="sub">Working in this MVP</div>
    <div className="mods">{built.map((m) => <ModCard key={m.id} m={m} onToggle={() => toggle(m)} />)}</div>
    <div className="sub">Coming soon — tick what you'd want first</div>
    <div className="mods">{soon.map((m) => <ModCard key={m.id} m={m} onToggle={() => toggle(m)} />)}</div>
    <div className="card note"><b>About this preview.</b> Propel Logistics Hub is an MVP concept adapted from the Warevolve warehouse app. Everything shown is fictional example data stored only in this browser — use “Reset demo data” in the menu to start again. Your choices on this page help shape what gets built next.</div>
  </>;
}
function ModCard({ m, onToggle }) {
  return <div className={`card mod ${m.on ? 'on' : ''}`}><div><div className="mod-name">{m.name} {!m.built && <span className="badge b-soon">Coming soon</span>}</div><div className="muted sm">{m.desc}</div></div>
    <button role="switch" aria-checked={m.on} aria-label={m.name} className={`switch ${m.on ? 'on' : ''}`} onClick={onToggle}><span /></button></div>;
}
