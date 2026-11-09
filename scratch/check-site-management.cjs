// Regression checks run in an isolated temporary database, never the store database.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const Module = require('node:module');
const ts = require('typescript');
const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'luc-catalog-'));
const resolve = Module._resolveFilename;
Module._resolveFilename = function(name, ...args) {
  return resolve.call(this, name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : name, ...args);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename);
require.extensions[".tsx"] = require.extensions[".ts"];
process.chdir(temporary);
(async () => {
try {
  const { serverDb: db, getDatabase } = require(path.join(root, 'src/lib/serverDb.ts'));
  const site = require(path.join(root, 'src/lib/siteStore.ts'));
  const { checkCoupon } = require(path.join(root, 'src/lib/coupons.ts'));
  const { DEFAULT_COLORS } = require(path.join(root, 'src/lib/siteDefaults.ts'));
  const connection = getDatabase();
  const createUser = (id, email, verified = 1) => connection.prepare("INSERT INTO users (id, full_name, email, password_hash, role, is_email_verified, created_at, updated_at) VALUES (?, 'Test', ?, 'not-a-password', 'customer', ?, 'now', 'now')").run(id, email, verified);
  createUser('alice', 'alice@example.com'); createUser('bob', 'bob@example.com'); createUser('unverified', 'no@example.com', 0);
  const pages = site.getPages();
  assert.equal(pages.length, 4);
  assert.ok(pages.find(page => page.id === 'home').sections.length >= 6);
  const draft = site.savePage({ id: '', slug: 'about-us', title: 'About us', description: '', seo: { title: 'About SEO', description: 'Our company', keywords: 'engraving,gifts' }, sections: [], builtIn: false, published: false, showInFooter: true });
  assert.equal(site.getPage('about-us').published, false);
  assert.throws(() => site.savePage({ ...draft, id: '', slug: 'checkout' }), /valid, unused/);
  assert.throws(() => site.savePage({ ...draft, id: '' }), /already uses/);
  assert.throws(() => site.savePage({ ...draft, slug: 'changed' }), /cannot be changed/);
  assert.throws(() => site.deletePage('home'), /Only custom/);
  const published = site.savePage({ ...draft, published: true, sections: [{ id: 'intro', title: 'Hello', body: '<script>alert(1)</script>\nPlain content', enabled: true }] });
  site.saveColors({ ...DEFAULT_COLORS, primary: '#10b981' });
  assert.equal(site.getColors().primary, '#10b981');
  assert.throws(() => site.saveColors({ ...DEFAULT_COLORS, primary: 'red;display:none' }), /six-digit/);
  const product = db.getProducts().find(product => product.inStock);
  const orderTemplate = db.getOrders()[0];
  let counter = 0;
  const order = (code, userId = 'alice', extra = {}) => db.createOrder({ ...orderTemplate, id: 'site-order-' + (++counter), orderNumber: 'SITE-' + counter, userId, customer: { fullName: 'Test', email: userId + '@example.com' }, items: [{ productId: product.id, productSlug: product.slug, quantity: 2, unitPrice: 1, productName: 'Forged', image: product.images[0] }], couponCode: code, subtotal: 2, total: 2, shippingFee: 299, ...extra });
  const template = { id: '', code: 'SAVE10', kind: 'percent', amount: 10, active: true, perUserLimit: 1, totalLimit: 0, minimumSubtotal: 0, emails: [], expiresAt: '' };
  const coupon = site.saveCoupon(template);
  assert.throws(() => checkCoupon(connection, coupon.code, null, 1000), /Sign in/);
  assert.throws(() => checkCoupon(connection, coupon.code, 'unverified', 1000), /Verify/);
  const result = order('save10');
  assert.equal(result.subtotal, product.price * 2, 'price must be recomputed from catalog');
  assert.equal(result.discount, Math.floor(product.price * 2 / 10));
  assert.equal(result.total, product.price * 2 + 299 - result.discount);
  assert.equal(result.couponCode, 'SAVE10');
  const before = db.getOrders().length;
  assert.throws(() => order('SAVE10'), /usage limit/);
  assert.equal(db.getOrders().length, before, 'failed coupon cannot create an order');
  order('SAVE10', 'bob');
  assert.equal(site.getCoupons().find(item => item.id === coupon.id).uses, 2);
  const assigned = site.saveCoupon({ ...template, code: 'ALICE', emails: ['Alice@Example.com'], kind: 'fixed', amount: 999999, perUserLimit: 2 });
  assert.throws(() => order('ALICE', 'bob'), /another customer/);
  assert.equal(order('ALICE').total, 299, 'discount must not consume shipping or make total negative');
  const beforeRollback = db.getOrders().length;
  assert.throws(() => order('ALICE', 'alice', { orderNumber: result.orderNumber }), /UNIQUE/);
  assert.equal(db.getOrders().length, beforeRollback);
  assert.equal(site.getCoupons().find(item => item.id === assigned.id).uses, 1, 'failed insert must not consume redemption');
  site.saveCoupon({ ...assigned, active: false });
  assert.throws(() => order('ALICE'), /inactive/);
  site.saveCoupon({ ...assigned, expiresAt: '2000-01-01T00:00:00Z' });
  assert.throws(() => order('ALICE'), /expired/);
  site.saveCoupon({ ...assigned, minimumSubtotal: 9999999 });
  assert.throws(() => order('ALICE'), /subtotal/);
  const limited = site.saveCoupon({ ...template, code: 'ONEONLY', totalLimit: 1, perUserLimit: 5 });
  order(limited.code); assert.throws(() => order(limited.code, 'bob'), /total usage limit/);
  site.deleteCoupon(coupon.id);
  assert.ok(!site.getCoupons().find(item => item.id === coupon.id));
  assert.throws(() => order('SAVE10'), /inactive/);
  assert.equal(db.getOrderById(result.id).discount, result.discount, 'deletion preserves order history');
  assert.throws(() => site.saveCoupon(template), /already been used/);
  assert.throws(() => site.saveCoupon({ ...template, code: 'BADPCT', amount: 101 }), /1–100/);
  const noCoupon = order(undefined);
  assert.equal(noCoupon.discount, 0); assert.equal(noCoupon.total, product.price * 2 + 299);
  // Route checks with controlled authentication; requests still execute real database logic.
  let admin = null;
  const load = Module._load;
  Module._load = function(name, ...args) {
    if (name === '@/lib/auth') return { getAuthenticatedAdmin: async () => admin, getAuthenticatedCustomer: async () => null };
    if (name === 'next/headers') return { headers: async () => new Headers({ host: 'localhost:3000' }) };
    return load.call(this, name, ...args);
  };
  const api = require(path.join(root, 'src/app/api/admin/site/[resource]/route.ts'));
  for (const resource of ['pages', 'coupons', 'colors']) {
    const context = { params: Promise.resolve({ resource }) };
    assert.equal((await api.GET(new Request('http://localhost'), context)).status, 401);
    assert.equal((await api.PUT(new Request('http://localhost', { method: 'PUT', body: '{}' }), context)).status, 401);
    assert.equal((await api.DELETE(new Request('http://localhost', { method: 'DELETE', body: '{}' }), context)).status, 401);
  }
  admin = { id: 'admin' };
  assert.equal((await api.GET(new Request('http://localhost'), { params: Promise.resolve({ resource: 'pages' }) })).status, 200);
  const publicApi = require(path.join(root, 'src/app/api/site/route.ts'));
  const publicData = await (await publicApi.GET()).json();
  assert.ok(publicData.pages.some(page => page.slug === 'about-us'));
  assert.equal(publicData.coupons, undefined);
  const pageRoute = require(path.join(root, 'src/app/[slug]/page.tsx'));
  const meta = await pageRoute.generateMetadata({ params: Promise.resolve({ slug: 'about-us' }) });
  assert.equal(meta.title.absolute, 'About SEO'); assert.deepEqual(meta.keywords, ['engraving', 'gifts']);
  site.savePage({ ...published, published: false });
  await assert.rejects(pageRoute.default({ params: Promise.resolve({ slug: 'about-us' }) }), error => error.digest === 'NEXT_HTTP_ERROR_FALLBACK;404');
  assert.ok(!(await (await publicApi.GET()).json()).pages.some(page => page.slug === 'about-us'));
  const { renderToStaticMarkup } = require('react-dom/server');
  const React = require('react');
  const Sections = require(path.join(root, 'src/components/site/PageSections.tsx')).default;
  const markup = renderToStaticMarkup(React.createElement(Sections, { sections: published.sections }));
  assert.ok(!markup.includes('<script>')); assert.ok(markup.includes('&lt;script&gt;'));
  // Reopen database: settings and coupon history persist independently of browser storage.
  global.__laseruv_db.close(); global.__laseruv_db = undefined;
  assert.equal(site.getColors().primary, '#10b981');
  assert.equal(site.getPage('about-us').published, false);
  assert.equal(db.getOrderById(result.id).discount, result.discount);
  Module._load = load;
  console.log('PASS: pages, drafts/SEO, safe content, colors, admin authorization, coupon eligibility, limits, totals, deletion history, rollback and persistence.');
} finally {
  global.__laseruv_db?.close(); global.__laseruv_db = undefined;
  process.chdir(root);
  assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(temporary).startsWith("luc-catalog-"));
  fs.rmSync(temporary, { recursive: true, force: true });
}

})().catch(error => { console.error(error); process.exitCode = 1; });
