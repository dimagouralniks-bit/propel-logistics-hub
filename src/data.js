// ALL DATA IN THIS FILE IS FICTIONAL DEMO DATA for the Propel Logistics Hub MVP.
// No real customers, SKUs, suppliers or records are used.
const d = (offsetDays, h = 9, m = 0) => {
  const t = new Date(); t.setDate(t.getDate() + offsetDays); t.setHours(h, m, 0, 0); return t.toISOString();
};
export const WAREHOUSES = [
  { id: 'WH-A', name: 'Warehouse A (Demo) · Southside', short: 'WH-A' },
  { id: 'WH-B', name: 'Warehouse B (Demo) · Northside', short: 'WH-B' },
  { id: 'WH-C', name: 'Overflow C (Demo) · Flex space', short: 'WH-C' },
];
export const CARRIERS = ['Demo Courier Express', 'Demo Freight Line', 'Demo Same-Day Van', 'Customer pickup'];
export const CLIENTS = [
  { id: 'C1', name: 'Acme Outdoor Co (demo)', contact: 'demo@acme-outdoor.example', billing: 'Per pallet / week', colour: '#dc6035' },
  { id: 'C2', name: 'Brightleaf Skincare (demo)', contact: 'demo@brightleaf.example', billing: 'Per unit picked', colour: '#2a7161' },
  { id: 'C3', name: 'Koala Kitchenware (demo)', contact: 'demo@koala-kitchen.example', billing: 'Per order + storage', colour: '#5d50be' },
  { id: 'C4', name: 'Northwind Parts (demo)', contact: 'demo@northwind.example', billing: 'Per pallet / week', colour: '#b8860b' },
];
const it = (sku, name, client, unitValue, reorder, stock, uom = 'unit') => ({ sku, name, client, unitValue, reorder, uom, stock });
export const ITEMS = [
  it('ACM-TENT-2P', '2-Person Hiking Tent', 'C1', 189, 20, [{ wh: 'WH-A', bin: 'A-01-03', qty: 64 }, { wh: 'WH-C', bin: 'C-10-01', qty: 40 }]),
  it('ACM-BAG-30L', '30L Day Pack', 'C1', 59, 40, [{ wh: 'WH-A', bin: 'A-02-01', qty: 22 }]),
  it('ACM-STOVE', 'Compact Camp Stove', 'C1', 75, 15, [{ wh: 'WH-A', bin: 'A-02-04', qty: 48 }]),
  it('ACM-LAMP', 'Rechargeable Lantern', 'C1', 35, 30, [{ wh: 'WH-B', bin: 'B-05-02', qty: 120 }]),
  it('BRL-SER-30', 'Vitamin C Serum 30ml', 'C2', 42, 100, [{ wh: 'WH-B', bin: 'B-01-01', qty: 340 }, { wh: 'WH-A', bin: 'A-07-02', qty: 60 }]),
  it('BRL-MOIST-50', 'Daily Moisturiser 50ml', 'C2', 28, 100, [{ wh: 'WH-B', bin: 'B-01-02', qty: 85 }]),
  it('BRL-GIFT-SET', 'Gift Set (3 piece)', 'C2', 79, 25, [{ wh: 'WH-B', bin: 'B-02-05', qty: 31 }]),
  it('KOA-PAN-28', '28cm Non-stick Pan', 'C3', 65, 30, [{ wh: 'WH-A', bin: 'A-04-01', qty: 210 }]),
  it('KOA-KNIFE-SET', 'Chef Knife Set', 'C3', 129, 20, [{ wh: 'WH-A', bin: 'A-04-03', qty: 12 }]),
  it('KOA-BOARD', 'Bamboo Chopping Board', 'C3', 24, 50, [{ wh: 'WH-C', bin: 'C-02-02', qty: 400 }]),
  it('NWP-FILTER', 'Air Filter Cartridge', 'C4', 18, 200, [{ wh: 'WH-B', bin: 'B-09-01', qty: 860 }, { wh: 'WH-C', bin: 'C-04-01', qty: 500 }]),
  it('NWP-PLT-BRKT', 'Steel Bracket (pallet)', 'C4', 640, 4, [{ wh: 'WH-C', bin: 'C-PLT-07', qty: 9 }], 'pallet'),
];
const tl = (...steps) => steps.map(([status, at]) => ({ status, at }));
export const ORDERS = [
  { id: 'ORD-1001', client: 'C1', customer: 'Demo Customer – J. Smith', wh: 'WH-A', lines: [{ sku: 'ACM-TENT-2P', qty: 2 }], carrier: 'Demo Courier Express', tracking: '', status: 'new', timeline: tl(['new', d(0, 8, 12)]) },
  { id: 'ORD-1002', client: 'C2', customer: 'Demo Retailer – Glow Store', wh: 'WH-B', lines: [{ sku: 'BRL-SER-30', qty: 24 }, { sku: 'BRL-MOIST-50', qty: 12 }], carrier: 'Demo Freight Line', tracking: '', status: 'picked', timeline: tl(['new', d(0, 7, 40)], ['picked', d(0, 9, 5)]) },
  { id: 'ORD-1003', client: 'C3', customer: 'Demo Customer – A. Nguyen', wh: 'WH-A', lines: [{ sku: 'KOA-PAN-28', qty: 1 }, { sku: 'KOA-BOARD', qty: 1 }], carrier: 'Demo Same-Day Van', tracking: '', status: 'packed', timeline: tl(['new', d(-1, 15, 0)], ['picked', d(0, 8, 30)], ['packed', d(0, 9, 20)]) },
  { id: 'ORD-1004', client: 'C4', customer: 'Demo Workshop – Fleet Svc', wh: 'WH-C', lines: [{ sku: 'NWP-PLT-BRKT', qty: 1 }], carrier: 'Demo Freight Line', tracking: 'DFL-778201', status: 'shipped', timeline: tl(['new', d(-1, 10, 0)], ['picked', d(-1, 12, 0)], ['packed', d(-1, 13, 0)], ['shipped', d(0, 7, 15)]) },
  { id: 'ORD-1005', client: 'C1', customer: 'Demo Customer – R. Patel', wh: 'WH-B', lines: [{ sku: 'ACM-LAMP', qty: 3 }], carrier: 'Demo Courier Express', tracking: 'DCE-552019', status: 'delivered', timeline: tl(['new', d(-3, 9, 0)], ['picked', d(-3, 11, 0)], ['packed', d(-3, 11, 30)], ['shipped', d(-2, 8, 0)], ['delivered', d(-1, 14, 10)]) },
  { id: 'ORD-1006', client: 'C2', customer: 'Demo Customer – M. Lee', wh: 'WH-B', lines: [{ sku: 'BRL-GIFT-SET', qty: 2 }], carrier: 'Demo Courier Express', tracking: '', status: 'new', timeline: tl(['new', d(0, 9, 45)]) },
];
export const INBOUND = [
  { id: 'ASN-501', client: 'C1', supplier: 'Demo Supplier – Trail Gear Ltd', wh: 'WH-A', eta: d(0, 11, 0), lines: [{ sku: 'ACM-BAG-30L', qty: 120, bin: 'A-02-01' }], status: 'expected', timeline: tl(['expected', d(-2, 10, 0)]) },
  { id: 'ASN-502', client: 'C3', supplier: 'Demo Supplier – Cookware Imports', wh: 'WH-A', eta: d(0, 8, 0), lines: [{ sku: 'KOA-KNIFE-SET', qty: 60, bin: 'A-04-03' }], status: 'arrived', timeline: tl(['expected', d(-3, 9, 0)], ['arrived', d(0, 8, 20)]) },
  { id: 'ASN-503', client: 'C2', supplier: 'Demo Supplier – Lab Botanics', wh: 'WH-B', eta: d(1, 10, 0), lines: [{ sku: 'BRL-MOIST-50', qty: 300, bin: 'B-01-02' }], status: 'expected', timeline: tl(['expected', d(-1, 16, 0)]) },
  { id: 'ASN-500', client: 'C4', supplier: 'Demo Supplier – Filter Works', wh: 'WH-B', eta: d(0, 7, 0), lines: [{ sku: 'NWP-FILTER', qty: 200, bin: 'B-09-01' }], status: 'putaway', timeline: tl(['expected', d(-4, 9, 0)], ['arrived', d(0, 7, 5)], ['checked', d(0, 7, 40)], ['putaway', d(0, 8, 10)]) },
];
export const MOVEMENTS = [
  { at: d(0, 8, 10), type: 'in', sku: 'NWP-FILTER', qty: 200, wh: 'WH-B', ref: 'ASN-500' },
  { at: d(0, 7, 15), type: 'out', sku: 'NWP-PLT-BRKT', qty: 1, wh: 'WH-C', ref: 'ORD-1004' },
  { at: d(-1, 14, 0), type: 'in', sku: 'KOA-PAN-28', qty: 80, wh: 'WH-A', ref: 'ASN-498' },
  { at: d(-2, 8, 0), type: 'out', sku: 'ACM-LAMP', qty: 3, wh: 'WH-B', ref: 'ORD-1005' },
];
export const MODULES = [
  { id: 'receiving', name: 'Receiving & put-away', desc: 'Inbound deliveries (ASNs) with arrive → check → put-away steps.', built: true, on: true },
  { id: 'dispatch', name: 'Pick, pack & dispatch', desc: 'One-tap order steps with carrier and tracking reference.', built: true, on: true },
  { id: 'clients', name: '3PL client view', desc: 'Stock held and activity per client account.', built: true, on: true },
  { id: 'alerts', name: 'Low-stock alerts', desc: 'Flag SKUs at or below their reorder point.', built: true, on: true },
  { id: 'barcode', name: 'Barcode / QR scanning', desc: 'Scan SKUs and bins with a phone camera or handheld scanner.', built: false, on: false },
  { id: 'carriers', name: 'Carrier integrations', desc: 'Book freight, print labels and pull live tracking from carriers.', built: false, on: false },
  { id: 'portal', name: 'Client portal', desc: 'Each client logs in to see their own stock, orders and invoices.', built: false, on: false },
  { id: 'invoicing', name: 'Invoicing & Xero sync', desc: 'Storage, pick/pack and freight charges pushed to Xero.', built: false, on: false },
  { id: 'shopify', name: 'Shopify / marketplace orders', desc: 'Pull web-store orders straight into the dispatch queue.', built: false, on: false },
  { id: 'space', name: 'Space & pallet utilisation', desc: 'Track pallet spaces and flex/overflow space per site.', built: false, on: false },
];
export const seed = () => JSON.parse(JSON.stringify({ items: ITEMS, orders: ORDERS, inbound: INBOUND, movements: MOVEMENTS, modules: MODULES, nextOrder: 1007, nextAsn: 504 }));
