import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { api, message } from './api';
import './index.css';
import {
  ShieldCheck, Package, ScanLine, LogOut, Plus, AlertTriangle, CheckCircle2,
  Truck, Factory, ClipboardCheck, ArrowRightLeft, Sparkles, Copy, Check,
  QrCode, Search, Filter, ShieldAlert, ArrowRight, ExternalLink, RefreshCw,
  Hash, Layers, Clock, MapPin, User, Tag, Lock, ChevronRight, X, Eye
} from 'lucide-react';

// --- Dynamic Color System Helpers ---
const EVENT_THEMES = {
  manufacturing: {
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/30',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    glow: 'shadow-emerald-500/10',
    icon: Factory,
    label: 'Manufacturing'
  },
  inspection: {
    bg: 'bg-violet-500/10 hover:bg-violet-500/15 border-violet-500/30',
    text: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    glow: 'shadow-violet-500/10',
    icon: ClipboardCheck,
    label: 'Inspection'
  },
  shipping: {
    bg: 'bg-sky-500/10 hover:bg-sky-500/15 border-sky-500/30',
    text: 'text-sky-400',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    glow: 'shadow-sky-500/10',
    icon: Truck,
    label: 'Shipping'
  },
  ownership_transfer: {
    bg: 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    glow: 'shadow-amber-500/10',
    icon: ArrowRightLeft,
    label: 'Ownership Transfer'
  }
};

const getEventTheme = (type) => EVENT_THEMES[type] || {
  bg: 'bg-slate-800/40 border-slate-700/50',
  text: 'text-cyan-400',
  badge: 'bg-slate-800 text-slate-300 border-slate-700',
  glow: 'shadow-slate-500/10',
  icon: Package,
  label: type ? type.replace(/_/g, ' ') : 'Event'
};

const CATEGORY_COLORS = [
  { bg: 'bg-teal-500/15 border-teal-500/40 text-teal-300' },
  { bg: 'bg-purple-500/15 border-purple-500/40 text-purple-300' },
  { bg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300' },
  { bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300' },
  { bg: 'bg-pink-500/15 border-pink-500/40 text-pink-300' },
  { bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' }
];

const getCategoryTheme = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[index];
};

const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const shortHash = (h) => h ? `${h.slice(0, 8)}...${h.slice(-8)}` : 'GENESIS';

// --- Global Toast Notification ---
function Toast({ msg, onClose }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900/95 border border-teal-500/40 px-5 py-3.5 text-slate-100 shadow-2xl shadow-teal-500/20 backdrop-blur-xl animate-bounce-short">
      <Sparkles className="text-teal-400" size={20} />
      <span className="text-sm font-semibold">{msg}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-200">
        <X size={16} />
      </button>
    </div>
  );
}

// --- Header ---
function Header({ user, setUser }) {
  const nav = useNavigate();
  const logout = () => {
    localStorage.removeItem('dpp_token');
    setUser(null);
    nav('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-teal-400 bg-clip-text text-transparent">
              PassportHub
            </span>
            <span className="hidden sm:inline-block ml-2 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-500/20">
              MSME MVP
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost text-xs sm:text-sm font-semibold">
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn-ghost text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300">
                  <ShieldAlert size={16} className="inline mr-1" /> Security
                </Link>
              )}
              <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-medium">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-semibold">{user.name}</span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-400 font-bold">{user.role}</span>
              </div>
              <button onClick={logout} className="btn-secondary !px-3" title="Sign out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/verify/DPP-GW-2026-0001" className="btn-ghost text-xs sm:text-sm font-medium">
                Try Demo Passport
              </Link>
              <Link className="btn-primary text-xs sm:text-sm" to="/login">
                Sign In
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

// --- Home Landing Page ---
function Home() {
  const [verifyInput, setVerifyInput] = useState('');
  const nav = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    if (verifyInput.trim()) {
      nav(`/verify/${verifyInput.trim()}`);
    }
  };

  return (
    <main className="relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-teal-500/20 via-cyan-500/10 to-purple-500/20 blur-[120px]" />
      
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:pt-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 border border-teal-500/30 px-4 py-1.5 text-xs font-semibold text-teal-300 backdrop-blur-md shadow-lg shadow-teal-500/10 mb-6">
            <Sparkles size={14} className="text-teal-400" />
            <span>Verifiable Product Traceability for MSMEs</span>
          </div>
          
          <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-slate-100 sm:text-6xl lg:text-7xl leading-tight">
            Cryptographic trust for every <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">product journey.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
            Low-cost QR digital product passports with immutable SHA-256 hash-linked event histories. Built specifically for local manufacturers, buyers, and compliance auditors.
          </p>

          {/* Quick Verify Bar */}
          <form onSubmit={handleVerify} className="mx-auto mt-10 max-w-xl flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-teal-500/10 backdrop-blur-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Enter Passport ID (e.g. DPP-GW-2026-0001)"
                className="w-full !bg-transparent !border-0 !ring-0 pl-10 pr-4 py-2.5 text-sm"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary whitespace-nowrap">
              Verify Passport <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-teal-400" /> No Registration Required for Public Search</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-teal-400" /> Tamper-Evident SHA-256 Hash Chains</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Package,
              title: "Digital Passport Creation",
              desc: "Generate unique passport IDs and downloadable QR codes for each product batch instantly.",
              color: "from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-400"
            },
            {
              icon: ScanLine,
              title: "Public QR Verification",
              desc: "Buyers and auditors scan any QR code to instantly verify origin, manufacturing date, and status.",
              color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400"
            },
            {
              icon: ShieldCheck,
              title: "Tamper-Evident Chain",
              desc: "Every lifecycle event stores `previous_hash` + `current_hash`. Any modification breaks integrity.",
              color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400"
            }
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className={`glass-card relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border bg-gradient-to-b ${item.color}`}>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/80 border border-slate-700/50 shadow-inner">
                  <IconComponent size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-100">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

// --- Login Page ---
function Login({ setUser }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: 'manufacturer@greenweave.demo', password: 'Demo@123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('dpp_token', data.token);
      setUser(data.user);
      nav('/dashboard');
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email, role) => {
    setForm({ email, password: 'Demo@123' });
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="glass-panel p-8 shadow-2xl border-slate-800">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-100">Welcome Back</h1>
          <p className="mt-1 text-xs text-slate-400">Sign in to manage product passports and lifecycle events.</p>
        </div>

        {/* Quick Demo Accout Switcher */}
        <div className="mb-6 rounded-xl bg-slate-950/80 border border-slate-800 p-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Demo Login:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickFill('manufacturer@greenweave.demo', 'Manufacturer')}
              className={`rounded-lg p-2 text-left text-xs transition-all border ${
                form.email.includes('manufacturer')
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block font-bold">Manufacturer</span>
              <span className="text-[10px] opacity-75">GreenWeave Demo</span>
            </button>
            <button
              type="button"
              onClick={() => quickFill('admin@passport.demo', 'Admin')}
              className={`rounded-lg p-2 text-left text-xs transition-all border ${
                form.email.includes('admin')
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block font-bold">System Admin</span>
              <span className="text-[10px] opacity-75">DPP Authority</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="label">Email Address</label>
            <input
              className="w-full"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              className="w-full"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button className="btn-primary w-full py-3 text-base" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          New manufacturer? <Link className="font-bold text-teal-400 hover:underline" to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}

// --- Register Page ---
function Register() {
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', organization: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', f);
      nav('/login');
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="glass-panel p-8 shadow-2xl border-slate-800">
        <h1 className="text-2xl font-black text-slate-100 mb-2">Register Manufacturer Account</h1>
        <p className="text-xs text-slate-400 mb-6">Create your manufacturer profile to register products & append lifecycle events.</p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={submit}>
          {[
            ['name', 'Your Name', 'text', 'Ananya Rao'],
            ['organization', 'MSME / Organization Name', 'text', 'GreenWeave Textiles'],
            ['email', 'Email Address', 'email', 'manufacturer@greenweave.demo'],
            ['password', 'Password', 'password', '8+ characters']
          ].map(([k, l, t, p]) => (
            <div key={k}>
              <label className="label">{l}</label>
              <input
                className="w-full"
                type={t}
                placeholder={p}
                required
                value={f[k]}
                onChange={(e) => setF({ ...f, [k]: e.target.value })}
              />
            </div>
          ))}

          <button className="btn-primary w-full py-3 text-base" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </main>
  );
}

// --- Dashboard ---
function Dashboard({ user }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [f, setF] = useState({ name: '', sku: '', category: 'Textiles', description: '', batchNumber: '', origin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/products')
      .then((r) => setProducts(r.data.products))
      .catch((e) => setError(message(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', f);
      setShowModal(false);
      setF({ name: '', sku: '', category: 'Textiles', description: '', batchNumber: '', origin: '' });
      load();
    } catch (e) {
      setError(message(e));
    }
  };

  const categories = ['ALL', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.passport_id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              {user.role === 'admin' ? 'Admin Security Control' : 'Manufacturer Workspace'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-100 mt-2">Digital Product Passports</h1>
        </div>

        {user.role === 'manufacturer' && (
          <button onClick={() => setShowModal(true)} className="btn-primary text-base">
            <Plus size={20} /> Register New Product
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-4 mb-8 flex flex-col md:flex-row gap-3 items-center justify-between border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, SKU, or passport ID..."
            className="w-full pl-10 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Filter size={14} /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                filterCategory === cat
                  ? 'bg-teal-500/20 border-teal-500/60 text-teal-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-teal-400" size={32} />
          <p className="text-sm">Loading digital passports...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => {
            const catTheme = getCategoryTheme(p.category);
            return (
              <Link
                to={`/products/${p.id}`}
                key={p.id}
                className="glass-card group relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] hover:border-teal-500/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`tag ${catTheme.bg}`}>{p.category}</span>
                    <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {p.passport_id}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-100 group-hover:text-teal-400 transition-colors">
                    {p.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400 font-mono">
                    SKU: <span className="text-slate-300 font-semibold">{p.sku}</span>
                  </p>

                  <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {p.description || 'No detailed description.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <User size={14} className="text-teal-400" />
                    <span className="truncate max-w-[140px]">{p.manufacturer_name || user.organization}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-teal-400">
                    <span>View Passport</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}

          {!filteredProducts.length && (
            <div className="col-span-full py-16 text-center glass-panel border-dashed border-slate-800">
              <Package size={40} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-300">No product passports found</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or register a new product.</p>
            </div>
          )}
        </div>
      )}

      {/* New Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-xl p-6 sm:p-8 border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Register Digital Product Passport</h2>
                <p className="text-xs text-slate-400">Create a new passport record with SHA-256 genesis hash link.</p>
              </div>
            </div>

            <form className="grid gap-4 sm:grid-cols-2" onSubmit={create}>
              <div className="sm:col-span-2">
                <label className="label">Product Name</label>
                <input
                  required
                  placeholder="e.g. Organic Cotton Tote Bag"
                  className="w-full"
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">SKU</label>
                <input
                  required
                  placeholder="e.g. GW-TOTE-01"
                  className="w-full"
                  value={f.sku}
                  onChange={(e) => setF({ ...f, sku: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  className="w-full"
                  value={f.category}
                  onChange={(e) => setF({ ...f, category: e.target.value })}
                >
                  <option value="Textiles">Textiles</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Food & Agriculture">Food & Agriculture</option>
                  <option value="Cosmetics">Cosmetics</option>
                  <option value="Handicrafts">Handicrafts</option>
                  <option value="General Goods">General Goods</option>
                </select>
              </div>

              <div>
                <label className="label">Batch Number</label>
                <input
                  placeholder="e.g. BATCH-2026-09"
                  className="w-full"
                  value={f.batchNumber}
                  onChange={(e) => setF({ ...f, batchNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Origin / Location</label>
                <input
                  placeholder="e.g. Tiruppur, Tamil Nadu"
                  className="w-full"
                  value={f.origin}
                  onChange={(e) => setF({ ...f, origin: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Product Description</label>
                <textarea
                  rows="3"
                  placeholder="Handcrafted reusable tote using certified organic cotton..."
                  className="w-full"
                  value={f.description}
                  onChange={(e) => setF({ ...f, description: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Generate Passport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// --- Product Detail & Event Management ---
function Product() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [qr, setQr] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [f, setF] = useState({ eventType: 'manufacturing', details: '', location: '', actorName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get(`/products/${id}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(message(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const addEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/events`, f);
      setF({ eventType: 'manufacturing', details: '', location: '', actorName: '' });
      setToastMsg('Lifecycle event cryptographically appended!');
      load();
    } catch (e) {
      setError(message(e));
    }
  };

  const showQr = () => {
    api.get(`/products/${id}/qr`)
      .then((r) => setQr(r.data))
      .catch((e) => setError(message(e)));
  };

  const copyLink = (text) => {
    navigator.clipboard.writeText(text);
    setToastMsg('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <main className="py-35 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-teal-400" size={32} />
        <p className="text-sm text-slate-400">Fetching passport data...</p>
      </main>
    );
  }

  if (!data) return <main className="p-10 text-center text-red-400">Product not found.</main>;

  const { product, events } = data;
  const catTheme = getCategoryTheme(product.category);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Toast msg={toastMsg} onClose={() => setToastMsg('')} />

      <div className="mb-6 flex items-center justify-between">
        <Link className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300" to="/dashboard">
          ← Back to Passports
        </Link>
        <Link
          to={`/verify/${product.passport_id}`}
          target="_blank"
          className="btn-secondary text-xs"
        >
          <ExternalLink size={14} /> View Public Passport Page
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_.6fr]">
        {/* Main Product Info & History */}
        <div className="space-y-8">
          {/* Header Card */}
          <div className="glass-panel p-6 sm:p-8 border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className={`tag ${catTheme.bg}`}>{product.category}</span>
              <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                {product.passport_id}
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-100">{product.name}</h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {product.description || 'No detailed description available.'}
            </p>

            <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-xs">
              <div>
                <dt className="text-slate-500 uppercase tracking-wider font-semibold mb-1">SKU</dt>
                <dd className="font-mono font-bold text-slate-200">{product.sku}</dd>
              </div>
              <div>
                <dt className="text-slate-500 uppercase tracking-wider font-semibold mb-1">Batch</dt>
                <dd className="font-mono font-bold text-slate-200">{product.batch_number || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 uppercase tracking-wider font-semibold mb-1">Origin</dt>
                <dd className="font-semibold text-slate-200">{product.origin || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 uppercase tracking-wider font-semibold mb-1">Status</dt>
                <dd className="font-bold text-teal-400 capitalize">{product.status}</dd>
              </div>
            </dl>
          </div>

          {/* Lifecycle Event Chain Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Layers className="text-teal-400" size={20} /> Cryptographic Lifecycle History
              </h2>
              <span className="text-xs font-mono text-slate-500">{events.length} records linked</span>
            </div>

            <div className="space-y-4">
              {events.map((e, index) => {
                const theme = getEventTheme(e.event_type);
                const IconComp = theme.icon;
                return (
                  <div
                    key={e.id}
                    className={`glass-panel p-5 border relative overflow-hidden transition-all duration-200 ${theme.bg}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl border ${theme.badge} shrink-0`}>
                        <IconComp size={22} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`tag ${theme.badge}`}>{theme.label}</span>
                            <span className="font-mono text-xs text-slate-500 font-bold">#{e.sequence_no}</span>
                          </div>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> {fmtDate(e.event_date)}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-slate-200 font-medium leading-relaxed">{e.details}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><User size={12} className="text-teal-400" /> {e.actor_name}</span>
                          {e.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-500" /> {e.location}</span>}
                        </div>

                        {/* Hash details bar */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 grid sm:grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="flex items-center justify-between rounded bg-slate-950/60 px-2.5 py-1.5 border border-slate-800">
                            <span className="text-slate-500">Prev: {shortHash(e.previous_hash)}</span>
                          </div>
                          <div className="flex items-center justify-between rounded bg-slate-950/60 px-2.5 py-1.5 border border-slate-800">
                            <span className="text-teal-400">Curr: {shortHash(e.current_hash)}</span>
                            <button
                              onClick={() => copyLink(e.current_hash)}
                              className="text-slate-400 hover:text-slate-200 ml-2"
                              title="Copy full hash"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!events.length && (
                <div className="glass-panel p-8 text-center text-slate-500 border-dashed">
                  No lifecycle events recorded for this product yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <aside className="space-y-6">
          {/* QR Passport Generation Card */}
          <div className="glass-panel p-6 border-slate-800">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <QrCode className="text-teal-400" size={18} /> Public QR Passport
            </h3>
            <p className="mt-1 text-xs text-slate-400">Generate a high-res QR code for packaging or verification.</p>

            <button onClick={showQr} className="btn-secondary mt-4 w-full text-xs">
              <QrCode size={16} /> Generate QR Code
            </button>

            {qr && (
              <div className="mt-5 text-center animate-fade-in p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <img className="mx-auto w-48 rounded-xl shadow-lg" src={qr.qrDataUrl} alt="QR Code" />
                <a
                  className="btn-primary mt-4 w-full text-xs"
                  href={qr.qrDataUrl}
                  download={`${qr.passportId}.png`}
                >
                  Download PNG
                </a>
              </div>
            )}
          </div>

          {/* Append Event Form */}
          <div className="glass-panel p-6 border-slate-800">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Plus className="text-teal-400" size={18} /> Append Lifecycle Event
            </h3>
            <p className="mt-1 text-xs text-slate-400">Records are immutable and SHA-256 hash-linked.</p>

            {error && (
              <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400">
                {error}
              </div>
            )}

            <form className="mt-4 space-y-3.5" onSubmit={addEvent}>
              <div>
                <label className="label">Event Type</label>
                <select
                  className="w-full text-xs"
                  value={f.eventType}
                  onChange={(e) => setF({ ...f, eventType: e.target.value })}
                >
                  <option value="manufacturing">Manufacturing</option>
                  <option value="inspection">Quality Inspection</option>
                  <option value="shipping">Logistics / Shipping</option>
                  <option value="ownership_transfer">Ownership Transfer</option>
                </select>
              </div>

              <div>
                <label className="label">Actor / Team Name</label>
                <input
                  required
                  placeholder="e.g. GreenWeave Quality Team"
                  className="w-full text-xs"
                  value={f.actorName}
                  onChange={(e) => setF({ ...f, actorName: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Location</label>
                <input
                  placeholder="e.g. Chennai, Tamil Nadu"
                  className="w-full text-xs"
                  value={f.location}
                  onChange={(e) => setF({ ...f, location: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Event Details</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe the action completed..."
                  className="w-full text-xs"
                  value={f.details}
                  onChange={(e) => setF({ ...f, details: e.target.value })}
                />
              </div>

              <button className="btn-primary w-full text-xs py-3">
                Append Hash-Linked Record
              </button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}

// --- Public Passport Verification Page ---
function Verify() {
  const { passportId } = useParams();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/verify/${passportId}`)
      .then((r) => setD(r.data))
      .catch((e) => setErr(message(e)))
      .finally(() => setLoading(false));
  }, [passportId]);

  if (loading) {
    return (
      <main className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-teal-400" size={36} />
        <p className="text-sm text-slate-400">Scanning cryptographic passport records...</p>
      </main>
    );
  }

  if (err) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <div className="glass-panel p-8 text-center border-red-500/30 bg-red-500/5">
          <AlertTriangle className="mx-auto text-red-400 mb-3" size={48} />
          <h1 className="text-2xl font-bold text-slate-100">Passport Unavailable</h1>
          <p className="mt-2 text-sm text-slate-400">{err}</p>
        </div>
      </main>
    );
  }

  const isValid = d.integrity.valid;
  const { product, events } = d;
  const catTheme = getCategoryTheme(product.category);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Dynamic Integrity Status Banner */}
      <div
        className={`glass-panel p-6 sm:p-8 border-2 transition-all shadow-2xl mb-8 ${
          isValid
            ? 'border-emerald-500/50 bg-emerald-500/10 shadow-emerald-500/10'
            : 'border-red-500/50 bg-red-500/10 shadow-red-500/10'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {isValid ? <CheckCircle2 size={36} /> : <AlertTriangle size={36} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isValid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                {isValid ? 'VERIFIED INTACT' : 'INTEGRITY WARNING'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 mt-1">
              {isValid ? 'Cryptographically Verified Digital Passport' : 'Tamper Alert Detected'}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {isValid
                ? `All ${d.integrity.checkedEvents} lifecycle records recomputed and 100% hash-matched.`
                : d.integrity.problems.join(' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Product Summary */}
      <div className="glass-panel p-6 sm:p-8 border-slate-800 mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className={`tag ${catTheme.bg}`}>{product.category}</span>
          <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
            {product.passport_id}
          </span>
        </div>

        <h2 className="text-3xl font-black text-slate-100">{product.name}</h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">{product.description}</p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-1">Manufacturer</span>
            <span className="font-bold text-slate-200">{product.organization || product.manufacturer_name}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-1">Origin</span>
            <span className="font-semibold text-slate-200">{product.origin || '—'}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-1">SKU</span>
            <span className="font-mono font-bold text-slate-200">{product.sku}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-1">Batch</span>
            <span className="font-mono font-bold text-slate-200">{product.batch_number || '—'}</span>
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
        <Layers className="text-teal-400" size={20} /> Verified Lifecycle Journey
      </h3>

      <div className="space-y-4">
        {events.map((e) => {
          const theme = getEventTheme(e.event_type);
          const IconComp = theme.icon;
          return (
            <div key={e.sequence_no} className={`glass-panel p-5 border ${theme.bg}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${theme.badge}`}>
                  <IconComp size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-100 capitalize">{e.event_type.replace('_', ' ')}</span>
                    <span className="text-xs text-slate-400">{fmtDate(e.event_date)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{e.details}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    Recorded by <span className="text-slate-300 font-semibold">{e.actor_name}</span> {e.location && `· ${e.location}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        Verification powered by PostgreSQL SHA-256 hash-linked lifecycle chains.
      </p>
    </main>
  );
}

// --- Admin Security Room ---
function Admin() {
  const [res, setRes] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  const runScan = () => {
    setScanning(true);
    api.get('/admin/integrity-check')
      .then((x) => setRes(x.data))
      .catch((e) => setError(message(e)))
      .finally(() => setScanning(false));
  };

  useEffect(() => {
    runScan();
    api.get('/admin/audit-logs')
      .then((x) => setLogs(x.data.logs))
      .catch(() => {});
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          Admin Security Room
        </span>
        <h1 className="text-3xl font-black text-slate-100 mt-2">Integrity & Audit Dashboard</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Integrity Scan Card */}
        <div className="glass-panel p-6 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="text-teal-400" size={20} /> Integrity Verification Scan
              </h2>
              <p className="text-xs text-slate-400">Recomputes hash chains across all stored product passports.</p>
            </div>
            <button onClick={runScan} className="btn-primary text-xs" disabled={scanning}>
              <RefreshCw className={scanning ? 'animate-spin' : ''} size={14} /> Run Scan
            </button>
          </div>

          {error && <div className="text-xs text-red-400 mb-3">{error}</div>}

          {res && (
            <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto pr-1">
              {res.results.map((x) => (
                <div key={x.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{x.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{x.passport_id}</span>
                  </div>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    x.integrity.valid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {x.integrity.valid ? 'INTACT' : 'CORRUPTED'} · {x.integrity.checkedEvents} events
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log Card */}
        <div className="glass-panel p-6 border-slate-800">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Clock className="text-purple-400" size={20} /> Audit Trail Log
          </h2>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {logs.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-purple-300 uppercase tracking-wide block">{l.action.replace(/_/g, ' ')}</span>
                  <span className="text-slate-400 text-[11px]">User: {l.user_name || 'System'}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{fmtDate(l.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// --- App Shell ---
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('dpp_token')) {
      api.get('/auth/me')
        .then((r) => setUser(r.data.user))
        .catch(() => localStorage.removeItem('dpp_token'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header user={user} setUser={setUser} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:passportId" element={<Verify />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Login setUser={setUser} />} />
          <Route path="/products/:id" element={user ? <Product /> : <Login setUser={setUser} />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Login setUser={setUser} />} />
        </Routes>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
