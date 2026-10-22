import React, { useEffect, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { api, message } from './api';
import { fireConfetti } from './confetti';
import './index.css';
import {
  ShieldCheck, Package, ScanLine, LogOut, Plus, AlertTriangle, CheckCircle2,
  Truck, Factory, ClipboardCheck, ArrowRightLeft, Sparkles, Copy,
  QrCode, Search, Filter, ShieldAlert, ArrowRight, ExternalLink, RefreshCw,
  Hash, Layers, Clock, MapPin, User, Lock, ChevronRight, X, Eye, Mail,
  Fingerprint, Link2, GraduationCap, Check, Printer, FileText, Download,
  Activity, ArrowUpRight, BarChart3, Database, Shield, Zap, Info, Bug,
  Leaf, Compass, Award, ExternalLink as ExtIcon
} from 'lucide-react';

// --- Semantic Event Themes ---
const EVENT_THEMES = {
  manufacturing: {
    bg: 'bg-emerald-950/30 hover:bg-emerald-950/40 border-emerald-500/30',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    glow: 'shadow-emerald-500/10',
    icon: Factory,
    label: 'Manufacturing'
  },
  inspection: {
    bg: 'bg-violet-950/30 hover:bg-violet-950/40 border-violet-500/30',
    text: 'text-violet-400',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/40',
    iconBg: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
    glow: 'shadow-violet-500/10',
    icon: ClipboardCheck,
    label: 'Quality Inspection'
  },
  shipping: {
    bg: 'bg-sky-950/30 hover:bg-sky-950/40 border-sky-500/30',
    text: 'text-sky-400',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    iconBg: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    glow: 'shadow-sky-500/10',
    icon: Truck,
    label: 'Logistics / Shipping'
  },
  ownership_transfer: {
    bg: 'bg-amber-950/30 hover:bg-amber-950/40 border-amber-500/30',
    text: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    glow: 'shadow-amber-500/10',
    icon: ArrowRightLeft,
    label: 'Ownership Transfer'
  }
};

const getEventTheme = (type) => EVENT_THEMES[type] || {
  bg: 'bg-slate-900/40 border-slate-700/50',
  text: 'text-teal-400',
  badge: 'bg-slate-800 text-slate-300 border-slate-700',
  iconBg: 'bg-slate-800 text-teal-400 border-slate-700',
  glow: 'shadow-slate-500/10',
  icon: Package,
  label: type ? type.replace(/_/g, ' ') : 'Event'
};

const CATEGORY_COLORS = [
  { bg: 'bg-teal-500/15 border-teal-500/40 text-teal-300' },
  { bg: 'bg-violet-500/15 border-violet-500/40 text-violet-300' },
  { bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' },
  { bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300' },
  { bg: 'bg-pink-500/15 border-pink-500/40 text-pink-300' },
  { bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' }
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
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const shortHash = (h) => {
  if (!h) return 'GENESIS';
  if (h === 'GENESIS') return 'GENESIS';
  return `${h.slice(0, 10)}...${h.slice(-10)}`;
};

// --- Toast Notification ---
function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [msg, onClose]);

  if (!msg) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900/95 border border-emerald-500/40 px-5 py-3.5 text-slate-100 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl animate-fade-in ring-1 ring-emerald-500/20">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
        <Sparkles size={18} />
      </div>
      <div>
        <span className="block text-xs uppercase tracking-wider font-bold text-emerald-400">Notification</span>
        <span className="text-sm font-semibold text-slate-200">{msg}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-3 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// --- Interactive Supply Chain Journey Visualizer (Horizontal Node Rail) ---
function SupplyChainVisualizer({ product, events = [], onNodeClick, activeNodeId }) {
  const milestones = useMemo(() => {
    const mfgEvent = events.find((e) => e.event_type === 'manufacturing');
    const inspEvent = events.find((e) => e.event_type === 'inspection');
    const shipEvent = events.find((e) => e.event_type === 'shipping');
    const transferEvent = events.find((e) => e.event_type === 'ownership_transfer');

    return [
      {
        id: 'raw_materials',
        label: 'Raw Materials',
        subtitle: 'Origin & Sourcing',
        facility: product.origin || 'Certified Origin',
        icon: Leaf,
        event: events[0] || { sequence_no: 1, current_hash: product.passport_id },
        isCompleted: true, // Always initialized when product is minted
        role: 'Farm / Harvest'
      },
      {
        id: 'factory_mill',
        label: 'Factory Mill',
        subtitle: 'Weaving & Fabrication',
        facility: mfgEvent?.actor_name || product.organization || 'Production Plant',
        icon: Factory,
        event: mfgEvent,
        isCompleted: Boolean(mfgEvent),
        role: 'Assembly / Mill'
      },
      {
        id: 'qa_lab',
        label: 'QA Lab',
        subtitle: 'Quality & Test Lab',
        facility: inspEvent?.actor_name || 'Inspection Facility',
        icon: ClipboardCheck,
        event: inspEvent,
        isCompleted: Boolean(inspEvent),
        role: 'Certification'
      },
      {
        id: 'logistics_cargo',
        label: 'Logistics Cargo',
        subtitle: 'Freight & Dispatch',
        facility: shipEvent?.actor_name || 'Logistics Hub',
        icon: Truck,
        event: shipEvent,
        isCompleted: Boolean(shipEvent),
        role: 'Transit Cargo'
      },
      {
        id: 'retail_store',
        label: 'Retail Store',
        subtitle: 'Custody Handover',
        facility: transferEvent?.actor_name || 'Retail Point of Sale',
        icon: ArrowRightLeft,
        event: transferEvent,
        isCompleted: Boolean(transferEvent),
        role: 'Consumer Retail'
      }
    ];
  }, [product, events]);

  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="glass-panel p-6 border-slate-800 relative overflow-hidden mb-8 animate-fade-up">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <Compass size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                Supply Chain Flow Rail
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {completedCount} of 5 Milestones Cryptographically Anchored
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-0.5 flex items-center gap-2">
              Interactive Supply Chain Journey Visualizer
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div className="w-40 hidden sm:block">
            <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
              <span className="font-bold">JOURNEY PROGRESS</span>
              <span className="text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 ease-out shadow-glow"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 hidden lg:inline-flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl font-medium">
            <Sparkles size={13} className="text-emerald-400" /> Click any completed node to spotlight SHA-256 block
          </span>
        </div>
      </div>

      {/* Horizontal Node Rail */}
      <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin relative z-10">
        <div className="min-w-[800px] flex items-start justify-between relative">
          {milestones.map((m, idx) => {
            const Icon = m.icon;
            const nextMilestone = milestones[idx + 1];
            const hasNext = Boolean(nextMilestone);
            const bothCompleted = m.isCompleted && nextMilestone?.isCompleted;
            const isActive = activeNodeId === m.id;

            return (
              <React.Fragment key={m.id}>
                <div className="flex flex-col items-center text-center relative z-10 group max-w-[150px] flex-1">
                  {/* Sequence pill */}
                  <span
                    className={`text-[10px] font-mono font-bold uppercase mb-2 px-2.5 py-0.5 rounded-full transition-all ${
                      m.isCompleted
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    0{idx + 1} · {m.isCompleted ? 'VERIFIED' : 'PENDING'}
                  </span>

                  {/* Central Glowing Beacon Button */}
                  <button
                    type="button"
                    disabled={!m.isCompleted}
                    onClick={() => onNodeClick && onNodeClick(m)}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                      m.isCompleted
                        ? 'cursor-pointer bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:shadow-emerald-500/50 animate-beacon-pulse'
                        : 'cursor-not-allowed bg-slate-950/90 border-2 border-dashed border-slate-800 text-slate-600'
                    } ${isActive ? 'ring-4 ring-emerald-400/60 scale-110' : ''}`}
                    title={
                      m.isCompleted
                        ? `Click to scroll to and spotlight Block #${m.event?.sequence_no || '1'} SHA-256 hash`
                        : 'Milestone pending recording in immutable ledger'
                    }
                  >
                    <Icon size={24} strokeWidth={m.isCompleted ? 2.5 : 1.8} />

                    {m.isCompleted && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-emerald-400 border border-emerald-500/60 text-[10px] shadow-sm">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </button>

                  {/* Stage Title */}
                  <h4
                    className={`text-xs font-bold mt-2.5 transition-colors ${
                      m.isCompleted ? 'text-slate-100 group-hover:text-emerald-300' : 'text-slate-500'
                    }`}
                  >
                    {m.label}
                  </h4>

                  {/* Facility / Location */}
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-[130px]" title={m.facility}>
                    {m.facility}
                  </p>

                  {/* Block Link Button */}
                  {m.isCompleted ? (
                    <button
                      type="button"
                      onClick={() => onNodeClick && onNodeClick(m)}
                      className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/20 transition-all"
                    >
                      <Hash size={10} />
                      <span>{m.event?.sequence_no ? `Block #${m.event.sequence_no}` : 'Root'}</span>
                      <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <span className="mt-2.5 text-[10px] text-slate-600 font-mono">
                      Awaiting Block
                    </span>
                  )}
                </div>

                {/* Animated Connector Line between Nodes */}
                {hasNext && (
                  <div className="flex-1 mt-7 -mx-2 px-1 relative">
                    {bothCompleted ? (
                      <div className="h-1.5 w-full rounded-full animate-energy-beam relative" />
                    ) : m.isCompleted ? (
                      <div className="relative h-1.5 w-full overflow-hidden">
                        <svg className="w-full h-1.5" preserveAspectRatio="none">
                          <line
                            x1="0"
                            y1="1"
                            x2="100%"
                            y2="1"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            className="animate-dash-flow opacity-80"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-0.5 w-full border-t-2 border-dashed border-slate-800/80" />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Certificate / Card View Modal ---
function CertificateModal({ product, events, onClose }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl border-emerald-500/30 p-6 sm:p-8 relative shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Official Digital Certificate
              </span>
              <span className="text-xs text-slate-500">SHA-256 Linked</span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-0.5">MSME Product Passport Certificate</h2>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Product Designation</span>
            <h3 className="text-2xl font-bold text-slate-100">{product.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Passport ID</span>
              <span className="font-mono font-bold text-emerald-400">{product.passport_id}</span>
            </div>
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">SKU Number</span>
              <span className="font-mono font-bold text-slate-200">{product.sku}</span>
            </div>
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Batch ID</span>
              <span className="font-mono font-bold text-slate-200">{product.batch_number || 'BATCH-001'}</span>
            </div>
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Origin</span>
              <span className="font-semibold text-slate-200 truncate block">{product.origin || 'India'}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-bold uppercase text-[11px]">Cryptographic Lifecycle Summary</span>
              <span className="font-mono text-emerald-400 font-bold">{events?.length || 0} Block Records</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every lifecycle event in this passport is anchored via cryptographic hash chaining starting from genesis root. Any alteration to manufacturing or shipping history immediately invalidates verification signatures.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Certified by DPP Authority · IDEA Lab Semester V
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="btn-secondary text-xs"
            >
              <Printer size={14} /> Print Certificate
            </button>
            <button
              onClick={onClose}
              className="btn-primary text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Hash Inspector Modal ---
function HashInspectorModal({ event, onClose }) {
  if (!event) return null;

  const canonicalPayload = JSON.stringify({
    sequence_no: event.sequence_no,
    event_type: event.event_type,
    event_date: event.event_date,
    location: event.location || '',
    details: event.details,
    actor_name: event.actor_name
  }, null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-xl border-cyan-500/30 p-6 relative shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Hash size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Cryptographic Hash Computation Inspector</h3>
            <p className="text-xs text-slate-400">Sequence #{event.sequence_no} · {event.event_type}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div>
            <span className="text-slate-400 font-bold block mb-1">Previous Block Hash (Parent):</span>
            <div className="rounded-xl bg-slate-950 p-2.5 font-mono text-[11px] text-slate-300 border border-slate-800 break-all select-all">
              {event.previous_hash || 'GENESIS'}
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-bold block mb-1">Canonical Normalized Event Payload:</span>
            <pre className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-x-auto max-h-40">
              {canonicalPayload}
            </pre>
          </div>

          <div>
            <span className="text-slate-400 font-bold block mb-1">Resulting SHA-256 Digest:</span>
            <div className="rounded-xl bg-slate-950 p-2.5 font-mono text-[11px] text-cyan-300 border border-cyan-500/40 break-all select-all font-bold">
              {event.current_hash}
            </div>
          </div>

          <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-[11px] text-cyan-300 leading-relaxed">
            Mathematical Rule: <span className="font-mono text-slate-200">SHA-256(previous_hash + canonical_event_json) = current_hash</span>.
            If any field in this block is modified, this resulting hash completely changes, breaking the next event's pointer!
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs">Close Inspector</button>
        </div>
      </div>
    </div>
  );
}

// --- Header ---
function Header({ user, setUser }) {
  const nav = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('dpp_token');
    setUser(null);
    nav('/');
  };

  const navLink = (to, label, icon) => {
    const Icon = icon;
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`btn-ghost !px-3 sm:!px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 rounded-xl transition-all ${
          active
            ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
            : 'text-slate-300 hover:text-white'
        }`}
      >
        {Icon && <Icon size={16} />}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
            <ShieldCheck size={24} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                PassportHub
              </span>
              <span className="hidden sm:inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/25">
                MSME DPP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 font-medium hidden md:block">
              Verifiable Cryptographic Traceability
            </p>
          </div>
        </Link>

        {/* Live Network Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-slate-900/90 border border-slate-800 px-3 py-1 text-[11px] font-medium text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>PGlite SHA-256 Ledger Active</span>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {navLink('/dashboard', 'Dashboard', Package)}
              {user.role === 'admin' && navLink('/admin', 'Security Room', ShieldAlert)}

              <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[11px]">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <span className="text-slate-200 font-semibold block leading-tight">{user.name}</span>
                  <span className="text-[10px] uppercase text-emerald-400 font-bold">{user.role}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="btn-secondary !px-3 text-xs"
                title="Sign out"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/verify/DPP-GW-2026-0001"
                className="hidden sm:inline-flex btn-ghost text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <ScanLine size={15} /> Try Sample Passport
              </Link>
              <Link className="btn-primary text-xs sm:text-sm font-bold" to="/login">
                Sign In <ArrowRight size={14} />
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

  const setSample = (code) => {
    setVerifyInput(code);
    nav(`/verify/${code}`);
  };

  return (
    <main className="relative overflow-hidden bg-grid">
      {/* Ambient Lighting Orbs */}
      <div className="mesh-orb -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-cyan-500/15" />
      <div className="mesh-orb top-60 -right-24 -z-10 h-80 w-80 bg-indigo-500/10" style={{ animationDelay: '2s' }} />
      <div className="mesh-orb top-96 -left-24 -z-10 h-72 w-72 bg-emerald-500/10" style={{ animationDelay: '4s' }} />

      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:pt-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 border border-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-500/10 mb-6 animate-fade-up">
            <Sparkles size={14} className="text-emerald-400 animate-pulse" />
            <span>Digital Product Passports · Semester V IDEA Lab MVP</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-slate-100 sm:text-6xl lg:text-7xl leading-[1.08] animate-fade-up" style={{ animationDelay: '0.08s' }}>
            Cryptographic trust for every{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              product journey.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg animate-fade-up leading-relaxed" style={{ animationDelay: '0.14s' }}>
            Low-cost QR digital product passports with immutable SHA-256 hash-linked lifecycle records. Built specifically for local MSME manufacturers, consumers, and compliance auditors.
          </p>

          {/* Verification Search Bar */}
          <form
            onSubmit={handleVerify}
            className="mx-auto mt-10 max-w-2xl flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl animate-fade-up focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Enter Passport ID (e.g. DPP-GW-2026-0001)..."
                className="w-full !bg-transparent !border-0 !ring-0 pl-10 pr-4 py-2.5 text-sm font-mono text-slate-100"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary whitespace-nowrap text-sm py-2.5">
              Verify Passport <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Pill Links */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs animate-fade-up" style={{ animationDelay: '0.24s' }}>
            <span className="text-slate-400 font-medium">Quick sample:</span>
            <button
              onClick={() => setSample('DPP-GW-2026-0001')}
              className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-emerald-400 font-mono hover:border-emerald-500/40 hover:bg-slate-850 transition-all"
            >
              DPP-GW-2026-0001 (Organic Cotton Tote)
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 animate-fade-up" style={{ animationDelay: '0.28s' }}>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> Public instant verify (no login)</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> SHA-256 parent-linked hash chain</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> Non-repudiation audit trails</span>
          </div>
        </div>

        {/* Live Metric Cards */}
        <div className="mt-16 grid gap-4 sm:grid-cols-4 stagger-children">
          {[
            { label: 'Integrity Engine', value: 'SHA-256 Hash Chain', icon: Hash, sub: 'Deterministic parent-linking' },
            { label: 'Public Verification', value: 'Zero-Login QR Scan', icon: ScanLine, sub: 'Instant cryptographic proof' },
            { label: 'Storage Layer', value: 'Append-Only Ledger', icon: Database, sub: 'Postgres & PGlite fallback' },
            { label: 'AI Intelligence', value: 'CrewAI + Gemini', icon: Zap, sub: 'Automated passport summaries' }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-panel p-5 border-slate-800/90 hover:border-emerald-500/30 transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                  <Icon size={20} />
                </div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">{stat.label}</p>
                <p className="text-base font-black text-slate-100 mt-0.5">{stat.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{stat.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Feature Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3 stagger-children">
          {[
            {
              icon: Package,
              title: "Digital Passport Issuance",
              desc: "Generate verifiable passport IDs and printable QR codes for each product batch instantly with unique genesis hashes.",
              badge: "Minting"
            },
            {
              icon: ScanLine,
              title: "Public QR Verification",
              desc: "Buyers, regulators, and consumers scan the QR code to recompute the entire hash chain and verify authenticity live.",
              badge: "Proof"
            },
            {
              icon: ShieldCheck,
              title: "Tamper-Evident Continuity",
              desc: "Every event hashes the previous record's hash + current event payload. Modifying any stored row breaks downstream links.",
              badge: "Security"
            }
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="glass-card relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-700/60 text-emerald-400 group-hover:scale-110 transition-transform">
                    <IconComponent size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* How It Works Diagram */}
        <div className="mt-16 glass-panel p-8 sm:p-10 border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Fingerprint className="text-emerald-400" size={22} />
              <h2 className="text-xl font-black text-slate-100">How the Tamper-Evident Chain Operates</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
              Not Blockchain · Low Overhead
            </span>
          </div>

          <ol className="grid gap-6 md:grid-cols-4 stagger-children">
            {[
              { step: '01', title: 'Genesis Mint', body: 'A product receives a globally unique passport ID anchored to a fixed 64-character genesis hash.' },
              { step: '02', title: 'Append Event', body: 'Factory production, quality control, shipping dispatch, or ownership change is recorded.' },
              { step: '03', title: 'Hash Linking', body: 'The server calculates SHA-256(previous_hash + canonical_event_json), creating an immutable chain.' },
              { step: '04', title: 'Verify Proof', body: 'When scanned, the server recomputes the hash chain from origin. Any tampered row fails instant verification.' }
            ].map((item) => (
              <li key={item.step} className="rounded-xl bg-slate-950/70 border border-slate-800 p-5 relative">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  STAGE {item.step}
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-100">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ol>
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
    <main className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
      <div className="grid overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-900/80 via-teal-900/60 to-slate-900 p-10 border-r border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <ShieldCheck size={16} /> IDEA Lab Demo Station
            </div>
            <h2 className="mt-4 text-3xl font-black text-slate-100 leading-tight">
              Sign in to manage product passports live.
            </h2>
            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              Authenticate as a local manufacturer to register goods and append cryptographic supply chain events, or sign in as system admin to perform full-ledger integrity audits.
            </p>
          </div>

          <div className="mt-10 space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-6">
            <p className="flex items-center gap-2"><Eye size={15} className="text-emerald-400" /> Public verification requires no credentials</p>
            <p className="flex items-center gap-2"><Hash size={15} className="text-teal-400" /> Embedded PGlite or PostgreSQL backend</p>
            <p className="flex items-center gap-2"><QrCode size={15} className="text-cyan-400" /> Instant dynamic QR passport generation</p>
          </div>
        </div>

        <div className="p-8 sm:p-10 animate-scale-in">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Lock size={22} />
            </div>
            <h1 className="text-2xl font-black text-slate-100">Welcome Back</h1>
            <p className="mt-1 text-xs text-slate-400">Sign in with demo credentials to test the passport system.</p>
          </div>

          {/* Quick 1-Click Credentials */}
          <div className="mb-6 rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>One-Click Demo Fill:</span>
              <span className="text-[10px] text-emerald-400 font-mono">PWD: Demo@123</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickFill('manufacturer@greenweave.demo', 'Manufacturer')}
                className={`rounded-xl p-2.5 text-left text-xs transition-all border ${
                  form.email.includes('manufacturer')
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="block font-bold text-slate-100">Manufacturer</span>
                <span className="text-[10px] text-slate-400 block truncate">GreenWeave Textiles</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@passport.demo', 'Admin')}
                className={`rounded-xl p-2.5 text-left text-xs transition-all border ${
                  form.email.includes('admin')
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 ring-1 ring-purple-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="block font-bold text-slate-100">System Admin</span>
                <span className="text-[10px] text-slate-400 block truncate">DPP Authority</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 flex items-center gap-2 animate-fade-in">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="label">Email Address</label>
              <input
                className="w-full text-sm"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="w-full text-sm"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button className="btn-primary w-full py-3 text-sm font-bold" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Register new business? <Link className="font-bold text-emerald-400 hover:underline" to="/register">Create an account</Link>
          </p>
        </div>
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

  const fillSample = () => {
    setF({
      name: 'Rajesh Kumar',
      organization: 'Aura Organic Handlooms',
      email: 'rajesh@aurahandloom.demo',
      password: 'Demo@123'
    });
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="glass-panel p-8 shadow-2xl border-slate-800 animate-scale-in">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-slate-100">Register Manufacturer</h1>
          <button
            type="button"
            onClick={fillSample}
            className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/25 hover:bg-emerald-500/20"
          >
            Fill Sample
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-6">Create a manufacturer profile to mint product passports & sign events.</p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={submit}>
          {[
            ['name', 'Your Full Name', 'text', 'e.g. Ananya Rao'],
            ['organization', 'MSME / Enterprise Name', 'text', 'e.g. GreenWeave Textiles'],
            ['email', 'Email Address', 'email', 'e.g. maker@enterprise.demo'],
            ['password', 'Password', 'password', '8+ characters']
          ].map(([k, l, t, p]) => (
            <div key={k}>
              <label className="label">{l}</label>
              <input
                className="w-full text-sm"
                type={t}
                placeholder={p}
                required
                value={f[k]}
                onChange={(e) => setF({ ...f, [k]: e.target.value })}
              />
            </div>
          ))}

          <button className="btn-primary w-full py-3 text-sm font-bold" disabled={loading}>
            {loading ? 'Creating Manufacturer Account...' : 'Create Manufacturer Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account? <Link className="font-bold text-emerald-400 hover:underline" to="/login">Sign in</Link>
        </p>
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
  const [toastMsg, setToastMsg] = useState('');

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
      setToastMsg('New product passport minted with Genesis SHA-256 hash!');
      fireConfetti();
      load();
    } catch (e) {
      setError(message(e));
    }
  };

  const fillTemplate = (type) => {
    if (type === 'textile') {
      setF({
        name: 'Organic Hemp Canvas Tote',
        sku: 'GW-HEMP-02',
        category: 'Textiles',
        batchNumber: 'BATCH-2026-H12',
        origin: 'Coimbatore, Tamil Nadu',
        description: 'Eco-friendly heavy-duty tote bag woven from sustainably sourced organic hemp fibers.'
      });
    } else if (type === 'spice') {
      setF({
        name: 'Single-Origin Malabar Black Pepper',
        sku: 'SPICE-MAL-99',
        category: 'Food & Agriculture',
        batchNumber: 'BATCH-PEP-44',
        origin: 'Wayanad, Kerala',
        description: 'Sun-dried high-piperine black peppercorns directly harvested by local farmer cooperatives.'
      });
    }
  };

  const categories = useMemo(() => ['ALL', ...new Set(products.map((p) => p.category))], [products]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.passport_id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Toast msg={toastMsg} onClose={() => setToastMsg('')} />

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
              {user.role === 'admin' ? 'System Administrator Console' : 'Manufacturer Workspace'}
            </span>
            <span className="text-xs text-slate-400">· {user.organization}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-100 mt-2">Digital Product Passports</h1>
        </div>

        {user.role === 'manufacturer' && (
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm font-bold shadow-lg shadow-emerald-500/25">
            <Plus size={18} /> Register New Product
          </button>
        )}
      </div>

      {/* Quick Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-4 border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Passports Active</span>
          <p className="text-2xl font-black text-slate-100 mt-1">{products.length}</p>
        </div>
        <div className="glass-panel p-4 border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Categories</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{categories.length - 1}</p>
        </div>
        <div className="glass-panel p-4 border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Hash Continuity</span>
          <p className="text-2xl font-black text-teal-400 mt-1">100% Intact</p>
        </div>
        <div className="glass-panel p-4 border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Verification Engine</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">SHA-256</p>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="glass-panel p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search by product name, SKU, or passport ID..."
            className="w-full pl-10 text-xs font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter size={13} /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                filterCategory === cat
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-emerald-400" size={32} />
          <p className="text-xs">Fetching digital product passports...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {filteredProducts.map((p) => {
            const catTheme = getCategoryTheme(p.category);
            return (
              <Link
                to={`/products/${p.id}`}
                key={p.id}
                className="glass-card group relative overflow-hidden flex flex-col justify-between hover:border-emerald-500/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`tag ${catTheme.bg}`}>{p.category}</span>
                    <span className="font-mono text-[11px] font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {p.passport_id}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {p.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>SKU: <span className="text-slate-200 font-semibold">{p.sku}</span></span>
                    {p.batch_number && <span>· Batch: <span className="text-slate-200">{p.batch_number}</span></span>}
                  </div>

                  <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {p.description || 'No detailed description available.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <User size={13} className="text-emerald-400" />
                    <span className="truncate max-w-[130px]">{p.manufacturer_name || user.organization}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Passport</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}

          {!filteredProducts.length && (
            <div className="col-span-full py-16 text-center glass-panel border-dashed border-slate-800">
              <Package size={40} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-300">No product passports found</h3>
              <p className="text-xs text-slate-500 mt-1">Try another search term or click "Register New Product".</p>
            </div>
          )}
        </div>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-xl p-6 sm:p-8 border-slate-800 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Plus size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Mint New Digital Passport</h2>
                  <p className="text-xs text-slate-400">Cryptographically registers product with Genesis root hash.</p>
                </div>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="mb-4 flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Quick sample fill:</span>
              <button
                type="button"
                onClick={() => fillTemplate('textile')}
                className="rounded bg-slate-950 px-2 py-1 text-emerald-400 border border-slate-800 hover:border-emerald-500/40"
              >
                + Hemp Tote Bag
              </button>
              <button
                type="button"
                onClick={() => fillTemplate('spice')}
                className="rounded bg-slate-950 px-2 py-1 text-cyan-400 border border-slate-800 hover:border-cyan-500/40"
              >
                + Malabar Pepper
              </button>
            </div>

            <form className="grid gap-3.5 sm:grid-cols-2" onSubmit={create}>
              <div className="sm:col-span-2">
                <label className="label">Product Name</label>
                <input
                  required
                  placeholder="e.g. Organic Cotton Tote Bag"
                  className="w-full text-xs"
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">SKU Number</label>
                <input
                  required
                  placeholder="e.g. GW-TOTE-02"
                  className="w-full text-xs font-mono"
                  value={f.sku}
                  onChange={(e) => setF({ ...f, sku: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  className="w-full text-xs"
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
                  placeholder="e.g. BATCH-2026-SEP"
                  className="w-full text-xs font-mono"
                  value={f.batchNumber}
                  onChange={(e) => setF({ ...f, batchNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Manufacturing Origin</label>
                <input
                  placeholder="e.g. Tiruppur, Tamil Nadu"
                  className="w-full text-xs"
                  value={f.origin}
                  onChange={(e) => setF({ ...f, origin: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Product Description</label>
                <textarea
                  rows="3"
                  placeholder="Handcrafted reusable tote using certified organic cotton..."
                  className="w-full text-xs"
                  value={f.description}
                  onChange={(e) => setF({ ...f, description: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-bold">
                  Generate Passport & Genesis Hash
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
  const [emailError, setEmailError] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [inspectEvent, setInspectEvent] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [spotlightId, setSpotlightId] = useState(null);
  const [activeVisualizerNode, setActiveVisualizerNode] = useState(null);
  const [f, setF] = useState({ eventType: 'inspection', details: '', location: '', actorName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get(`/products/${id}`)
      .then((r) => {
        setData(r.data);
      })
      .catch((e) => setError(message(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const addEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/events`, f);
      setF({ eventType: 'shipping', details: '', location: '', actorName: '' });
      setToastMsg('Lifecycle record appended and SHA-256 parent link updated!');
      fireConfetti();
      load();
    } catch (e) {
      setError(message(e));
    }
  };

  const showQr = () => {
    api.get(`/products/${id}/qr`)
      .then((r) => {
        setQr(r.data);
        setToastMsg('QR Passport generated successfully!');
      })
      .catch((e) => setError(message(e)));
  };

  const emailPassportSummary = async () => {
    setEmailError('');
    setEmailSending(true);
    try {
      const { data: result } = await api.post(`/agent/email-passport/${id}`);
      setToastMsg(`Passport summary emailed to ${result.recipientEmail}.`);
    } catch (e) {
      setEmailError(message(e));
    } finally {
      setEmailSending(false);
    }
  };

  const copyText = (text, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    setToastMsg(`${label} copied to clipboard!`);
  };

  // Click handler for Supply Chain Visualizer nodes
  const handleVisualizerNodeClick = (milestone) => {
    setActiveVisualizerNode(milestone.id);

    if (milestone.event?.id || milestone.event?.sequence_no) {
      const targetId = `event-block-${milestone.event.id || milestone.event.sequence_no}`;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSpotlightId(milestone.event.id || milestone.event.sequence_no);
        setToastMsg(`Spotlighting Block #${milestone.event.sequence_no} (${milestone.label}) SHA-256 hash!`);
        setTimeout(() => setSpotlightId(null), 3000);
        return;
      }
    }

    // Fallback to history section top
    const historySection = document.getElementById('lifecycle-history-section');
    if (historySection) {
      historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setToastMsg(`Viewing origin records for ${milestone.label}.`);
    }
  };

  const setPreset = (presetType) => {
    if (presetType === 'inspection') {
      setF({
        eventType: 'inspection',
        actorName: 'GreenWeave QA Laboratory',
        location: 'Tiruppur, Tamil Nadu',
        details: 'Passed ISO 14001 textile inspection and seam strength tensile test.'
      });
    } else if (presetType === 'shipping') {
      setF({
        eventType: 'shipping',
        actorName: 'BlueDart Express Logistics',
        location: 'Chennai Air Hub',
        details: 'Batch packed in tamper-evident crates and dispatched for destination port.'
      });
    } else if (presetType === 'transfer') {
      setF({
        eventType: 'ownership_transfer',
        actorName: 'EcoRetail India Pvt Ltd',
        location: 'Bengaluru, Karnataka',
        details: 'Custody and retail inventory ownership legally acknowledged.'
      });
    }
  };

  if (loading) {
    return (
      <main className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-emerald-400" size={32} />
        <p className="text-xs text-slate-400">Fetching passport records...</p>
      </main>
    );
  }

  if (!data) return <main className="p-10 text-center text-red-400">Product not found.</main>;

  const { product, events } = data;
  const catTheme = getCategoryTheme(product.category);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Toast msg={toastMsg} onClose={() => setToastMsg('')} />
      {inspectEvent && <HashInspectorModal event={inspectEvent} onClose={() => setInspectEvent(null)} />}
      {showCertificate && <CertificateModal product={product} events={events} onClose={() => setShowCertificate(false)} />}

      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300" to="/dashboard">
          ← Back to Passports
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCertificate(true)}
            className="btn-secondary text-xs"
          >
            <Printer size={14} /> Certificate
          </button>
          <button
            type="button"
            onClick={emailPassportSummary}
            disabled={emailSending}
            className="btn-secondary text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail size={14} /> {emailSending ? 'Generating AI summary...' : 'Email AI Summary'}
          </button>
          <Link
            to={`/verify/${product.passport_id}`}
            target="_blank"
            className="btn-primary text-xs font-bold"
          >
            <ExternalLink size={14} /> Public Verify Page
          </Link>
        </div>
      </div>

      {emailError && (
        <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{emailError}</span>
        </div>
      )}

      {/* 🌐 Interactive Supply Chain Journey Visualizer (Horizontal Node Rail) */}
      <SupplyChainVisualizer
        product={product}
        events={events}
        onNodeClick={handleVisualizerNodeClick}
        activeNodeId={activeVisualizerNode}
      />

      <div className="grid gap-8 lg:grid-cols-[1.4fr_.6fr]">
        <div className="space-y-8">
          {/* Main Product Info Card */}
          <div className="glass-panel p-6 sm:p-8 border-slate-800 animate-fade-up">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className={`tag ${catTheme.bg}`}>{product.category}</span>
              <button
                onClick={() => copyText(product.passport_id, 'Passport ID')}
                className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1.5 transition-colors"
                title="Click to copy Passport ID"
              >
                <Hash size={13} /> {product.passport_id} <Copy size={11} className="opacity-70" />
              </button>
            </div>

            <h1 className="text-3xl font-black text-slate-100">{product.name}</h1>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {product.description || 'No detailed description available.'}
            </p>

            <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
              <div className="rounded-xl bg-slate-950/50 p-2.5 border border-slate-800/80">
                <dt className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] mb-0.5">SKU</dt>
                <dd className="font-mono font-bold text-slate-200">{product.sku}</dd>
              </div>
              <div className="rounded-xl bg-slate-950/50 p-2.5 border border-slate-800/80">
                <dt className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] mb-0.5">Batch</dt>
                <dd className="font-mono font-bold text-slate-200">{product.batch_number || '—'}</dd>
              </div>
              <div className="rounded-xl bg-slate-950/50 p-2.5 border border-slate-800/80">
                <dt className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] mb-0.5">Origin</dt>
                <dd className="font-semibold text-slate-200">{product.origin || '—'}</dd>
              </div>
              <div className="rounded-xl bg-slate-950/50 p-2.5 border border-slate-800/80">
                <dt className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] mb-0.5">Status</dt>
                <dd className="font-bold text-emerald-400 capitalize">{product.status}</dd>
              </div>
            </dl>

            {/* ESG & Sustainability Compliance Scorecard Pill */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                <Sparkles size={12} className="text-emerald-400" /> ESG Attributes:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-[11px]">
                1.8 kg CO₂e
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/25 text-teal-300 text-[11px]">
                100% Recyclable
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[11px]">
                ISO 14001 Audited
              </span>
            </div>
          </div>

          {/* Cryptographic Event Chain */}
          <div id="lifecycle-history-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Layers className="text-emerald-400" size={20} /> Cryptographic Lifecycle History
              </h2>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {events.length} Hash-Linked Records
              </span>
            </div>

            <div className="space-y-4 timeline-rail">
              {events.map((e, index) => {
                const theme = getEventTheme(e.event_type);
                const IconComp = theme.icon;
                const isSpotlighted = spotlightId === (e.id || e.sequence_no);

                return (
                  <div
                    key={e.id || e.sequence_no}
                    id={`event-block-${e.id || e.sequence_no}`}
                    className={`glass-panel p-5 border relative overflow-hidden transition-all duration-300 ${
                      isSpotlighted ? 'spotlight-active' : theme.bg
                    }`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl border ${theme.iconBg} shrink-0 shadow-lg`}>
                        <IconComp size={22} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`tag ${theme.badge}`}>{theme.label}</span>
                            <span className="font-mono text-xs text-slate-400 font-bold">Sequence #{e.sequence_no}</span>
                            {isSpotlighted && (
                              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded animate-pulse">
                                Spotlight Active
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> {fmtDate(e.event_date)}
                          </span>
                        </div>

                        <p className="mt-3 text-xs text-slate-200 font-medium leading-relaxed">{e.details}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5"><User size={13} className="text-emerald-400" /> {e.actor_name}</span>
                          {e.location && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" /> {e.location}</span>}
                        </div>

                        {/* Hash Links Box */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 grid sm:grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="hash-chip flex items-center justify-between">
                            <span className="text-slate-400 truncate">Prev: <span className="text-slate-300">{shortHash(e.previous_hash)}</span></span>
                            {e.previous_hash && (
                              <button
                                onClick={() => copyText(e.previous_hash, 'Previous hash')}
                                className="text-slate-400 hover:text-slate-200 ml-1.5"
                                title="Copy full hash"
                              >
                                <Copy size={11} />
                              </button>
                            )}
                          </div>
                          <div className="hash-chip flex items-center justify-between border-emerald-500/30">
                            <span className="text-emerald-400 truncate">Curr: {shortHash(e.current_hash)}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => copyText(e.current_hash, 'Current hash')}
                                className="text-slate-400 hover:text-slate-200"
                                title="Copy full current hash"
                              >
                                <Copy size={11} />
                              </button>
                              <button
                                onClick={() => setInspectEvent(e)}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase underline"
                                title="Inspect math"
                              >
                                Math
                              </button>
                            </div>
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

        {/* Right Sidebar: QR Code & Append Event Form */}
        <aside className="space-y-6">
          <div className="glass-panel p-6 border-slate-800 animate-slide-in">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <QrCode className="text-emerald-400" size={18} /> Public QR Passport
            </h3>
            <p className="mt-1 text-xs text-slate-400">Generate on-demand high resolution QR code for packaging.</p>

            <button onClick={showQr} className="btn-secondary mt-4 w-full text-xs">
              <QrCode size={16} /> Render QR Code
            </button>

            {qr && (
              <div className="mt-5 text-center animate-fade-in p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="p-3 bg-white rounded-xl inline-block shadow-lg">
                  <img className="mx-auto w-44 rounded" src={qr.qrDataUrl} alt="Passport QR" />
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    className="btn-primary flex-1 text-xs py-2 font-bold"
                    href={qr.qrDataUrl}
                    download={`${qr.passportId}.png`}
                  >
                    <Download size={13} /> Download
                  </a>
                  <button
                    type="button"
                    onClick={() => copyText(`${window.location.origin}/verify/${qr.passportId}`, 'Verification URL')}
                    className="btn-secondary text-xs py-2"
                    title="Copy verify link"
                  >
                    <Copy size={13} /> Link
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel p-6 border-slate-800 animate-slide-in" style={{ animationDelay: '0.08s' }}>
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Plus className="text-emerald-400" size={18} /> Append Lifecycle Event
            </h3>
            <p className="mt-1 text-xs text-slate-400">New records are cryptographically hashed and parent-linked.</p>

            {/* Event Presets */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPreset('inspection')}
                className="text-[10px] font-bold text-violet-300 bg-violet-500/10 px-2 py-1 rounded border border-violet-500/30 hover:bg-violet-500/20"
              >
                + Quality Test
              </button>
              <button
                type="button"
                onClick={() => setPreset('shipping')}
                className="text-[10px] font-bold text-sky-300 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/30 hover:bg-sky-500/20"
              >
                + Dispatched
              </button>
              <button
                type="button"
                onClick={() => setPreset('transfer')}
                className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30 hover:bg-amber-500/20"
              >
                + Retail Handover
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400">
                {error}
              </div>
            )}

            <form className="mt-4 space-y-3" onSubmit={addEvent}>
              <div>
                <label className="label">Event Type</label>
                <select
                  className="w-full text-xs"
                  value={f.eventType}
                  onChange={(e) => setF({ ...f, eventType: e.target.value })}
                >
                  <option value="manufacturing">Manufacturing Milestone</option>
                  <option value="inspection">Quality Inspection</option>
                  <option value="shipping">Logistics / Shipping</option>
                  <option value="ownership_transfer">Ownership Transfer</option>
                </select>
              </div>

              <div>
                <label className="label">Actor / Department</label>
                <input
                  required
                  placeholder="e.g. GreenWeave QA Team"
                  className="w-full text-xs"
                  value={f.actorName}
                  onChange={(e) => setF({ ...f, actorName: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Facility Location</label>
                <input
                  placeholder="e.g. Chennai, Tamil Nadu"
                  className="w-full text-xs"
                  value={f.location}
                  onChange={(e) => setF({ ...f, location: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Action Details</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe the certified action completed..."
                  className="w-full text-xs"
                  value={f.details}
                  onChange={(e) => setF({ ...f, details: e.target.value })}
                />
              </div>

              <button className="btn-primary w-full text-xs py-3 font-bold">
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
  const [simulatedTamper, setSimulatedTamper] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [spotlightId, setSpotlightId] = useState(null);
  const [activeVisualizerNode, setActiveVisualizerNode] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/verify/${passportId}`)
      .then((r) => {
        setD(r.data);
        if (r.data.integrity.valid) {
          fireConfetti();
        }
      })
      .catch((e) => setErr(message(e)))
      .finally(() => setLoading(false));
  }, [passportId]);

  const handleVisualizerNodeClick = (milestone) => {
    setActiveVisualizerNode(milestone.id);

    if (milestone.event?.id || milestone.event?.sequence_no) {
      const targetId = `verify-event-${milestone.event.sequence_no}`;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSpotlightId(milestone.event.sequence_no);
        setToastMsg(`Spotlighted Block #${milestone.event.sequence_no} (${milestone.label})!`);
        setTimeout(() => setSpotlightId(null), 3000);
        return;
      }
    }
  };

  if (loading) {
    return (
      <main className="py-28 text-center flex flex-col items-center justify-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <ShieldCheck className="absolute text-emerald-400" size={24} />
        </div>
        <p className="text-xs text-slate-300 font-medium">Recomputing SHA-256 cryptographic chain...</p>
      </main>
    );
  }

  if (err) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <div className="glass-panel p-8 text-center border-red-500/30 bg-red-500/5 animate-scale-in">
          <AlertTriangle className="mx-auto text-red-400 mb-3" size={48} />
          <h1 className="text-2xl font-bold text-slate-100">Passport Record Unavailable</h1>
          <p className="mt-2 text-xs text-slate-400">{err}</p>
          <Link to="/" className="btn-secondary mt-6 text-xs inline-flex">
            Return to Verification Search
          </Link>
        </div>
      </main>
    );
  }

  // Determine integrity status (accounting for interactive tamper demonstration)
  const actualValid = d.integrity.valid;
  const isValid = simulatedTamper ? false : actualValid;
  const { product, events } = d;
  const catTheme = getCategoryTheme(product.category);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Toast msg={toastMsg} onClose={() => setToastMsg('')} />

      {/* Interactive Tamper Demonstration Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 px-5">
        <div className="flex items-center gap-2.5">
          <Bug className={simulatedTamper ? 'text-red-400 animate-bounce' : 'text-slate-400'} size={18} />
          <div>
            <span className="text-xs font-bold text-slate-200 block">IDEA Lab Tamper Simulation Mode</span>
            <span className="text-[11px] text-slate-400">Test how the cryptographic verification engine detects unauthorized edits.</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !simulatedTamper;
            setSimulatedTamper(next);
            setToastMsg(next ? 'Simulating data corruption on block #2!' : 'Chain integrity restored.');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            simulatedTamper
              ? 'bg-red-500/20 border-red-500 text-red-300 ring-2 ring-red-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          {simulatedTamper ? 'Reset Integrity Test' : 'Simulate 1-Bit Tamper'}
        </button>
      </div>

      {/* Main Verification Status Shield */}
      <div
        className={`glass-panel relative overflow-hidden p-6 sm:p-8 border-2 transition-all shadow-2xl mb-8 animate-scale-in ${
          isValid
            ? 'border-emerald-500/50 bg-emerald-950/20 shadow-emerald-500/10'
            : 'border-red-500/60 bg-red-950/25 shadow-red-500/15'
        }`}
      >
        {/* Animated Laser Scanning Beam */}
        <div
          className={`pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b ${
            isValid ? 'from-emerald-400/25 to-transparent' : 'from-red-400/25 to-transparent'
          } animate-laser`}
        />

        <div className="flex items-start gap-4 relative">
          <div className={`p-3.5 rounded-2xl ${isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} shadow-lg`}>
            {isValid ? <CheckCircle2 size={36} /> : <AlertTriangle size={36} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isValid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                {isValid ? 'VERIFIED INTACT · 100% MATCH' : 'TAMPER ALERT · HASH MISMATCH'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 mt-1.5">
              {isValid ? 'Cryptographically Verified Digital Passport' : 'Ledger Inconsistency Detected'}
            </h1>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {isValid
                ? `All ${d.integrity.checkedEvents} lifecycle blocks were recomputed from origin hash. Zero records modified.`
                : simulatedTamper
                ? 'Simulation: Canonical payload for block #2 was altered. Resulting SHA-256 hash does not match next block parent link!'
                : d.integrity.problems.join(' ')}
            </p>
          </div>
        </div>
      </div>

      {/* 🌐 Supply Chain Journey Visualizer on Verify Page */}
      <SupplyChainVisualizer
        product={product}
        events={events}
        onNodeClick={handleVisualizerNodeClick}
        activeNodeId={activeVisualizerNode}
      />

      {/* Product Details Card */}
      <div className="glass-panel p-6 sm:p-8 border-slate-800 mb-8 animate-fade-up">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className={`tag ${catTheme.bg}`}>{product.category}</span>
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
            {product.passport_id}
          </span>
        </div>

        <h2 className="text-3xl font-black text-slate-100">{product.name}</h2>
        <p className="mt-2 text-xs text-slate-300 leading-relaxed">{product.description}</p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-semibold text-[10px] mb-1">Manufacturer</span>
            <span className="font-bold text-slate-200">{product.organization || product.manufacturer_name}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-semibold text-[10px] mb-1">Origin</span>
            <span className="font-semibold text-slate-200">{product.origin || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-semibold text-[10px] mb-1">SKU</span>
            <span className="font-mono font-bold text-slate-200">{product.sku}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-semibold text-[10px] mb-1">Batch</span>
            <span className="font-mono font-bold text-slate-200">{product.batch_number || '—'}</span>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
        <Layers className="text-emerald-400" size={20} /> Verified Lifecycle Journey
      </h3>

      {/* Verified Events List */}
      <div className="space-y-4 timeline-rail stagger-children">
        {events.map((e, idx) => {
          const theme = getEventTheme(e.event_type);
          const IconComp = theme.icon;
          const isTamperedBlock = simulatedTamper && idx === 1;
          const isSpotlighted = spotlightId === e.sequence_no;

          return (
            <div
              key={e.sequence_no}
              id={`verify-event-${e.sequence_no}`}
              className={`glass-panel p-5 border transition-all duration-300 ${
                isSpotlighted
                  ? 'spotlight-active'
                  : isTamperedBlock
                  ? 'border-red-500 bg-red-950/30 ring-2 ring-red-500/30'
                  : theme.bg
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${isTamperedBlock ? 'bg-red-500/20 text-red-400' : theme.badge}`}>
                  <IconComp size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 capitalize">{e.event_type.replace('_', ' ')}</span>
                      {isTamperedBlock && (
                        <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                          Checksum Failure
                        </span>
                      )}
                      {isSpotlighted && (
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded animate-pulse">
                          Spotlighted
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{fmtDate(e.event_date)}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{e.details}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    Recorded by <span className="text-slate-200 font-semibold">{e.actor_name}</span> {e.location && `· ${e.location}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Verification powered by PostgreSQL SHA-256 hash-linked lifecycle chains · Semester V IDEA Lab MVP
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
  const [logFilter, setLogFilter] = useState('');

  const runScan = () => {
    setScanning(true);
    api.get('/admin/integrity-check')
      .then((x) => {
        setRes(x.data);
      })
      .catch((e) => setError(message(e)))
      .finally(() => setScanning(false));
  };

  useEffect(() => {
    runScan();
    api.get('/admin/audit-logs')
      .then((x) => setLogs(x.data.logs))
      .catch(() => {});
  }, []);

  const filteredLogs = logs.filter((l) =>
    l.action.toLowerCase().includes(logFilter.toLowerCase()) ||
    (l.user_name && l.user_name.toLowerCase().includes(logFilter.toLowerCase()))
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/25">
          Admin Security Room
        </span>
        <h1 className="text-3xl font-black text-slate-100 mt-2">Integrity & Audit Dashboard</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Verification Scan Card */}
        <div className="glass-panel p-6 border-slate-800 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={20} /> Integrity Verification Scan
              </h2>
              <p className="text-xs text-slate-400">Recomputes hash chains across all product passports in database.</p>
            </div>
            <button onClick={runScan} className="btn-primary text-xs font-bold" disabled={scanning}>
              <RefreshCw className={scanning ? 'animate-spin' : ''} size={14} /> Run Full Scan
            </button>
          </div>

          {error && <div className="text-xs text-red-400 mb-3">{error}</div>}

          {res && (
            <div className="space-y-2 mt-4 max-h-[420px] overflow-y-auto pr-1 stagger-children">
              {res.results.map((x) => (
                <div key={x.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs hover:border-emerald-500/30 transition-colors">
                  <div>
                    <span className="font-bold text-slate-200 block">{x.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{x.passport_id}</span>
                  </div>
                  <span className={`font-bold px-2.5 py-1 rounded text-[10px] border ${
                    x.integrity.valid
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {x.integrity.valid ? 'INTACT' : 'TAMPERED'} · {x.integrity.checkedEvents} events
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Trail Log */}
        <div className="glass-panel p-6 border-slate-800 animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Clock className="text-purple-400" size={20} /> Audit Trail Log
            </h2>
            <div className="w-44">
              <input
                type="text"
                placeholder="Search audit trail..."
                className="w-full text-xs py-1.5 px-2.5"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredLogs.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs hover:border-purple-500/30 transition-colors">
                <div>
                  <span className="font-bold text-purple-300 uppercase tracking-wide block">{l.action.replace(/_/g, ' ')}</span>
                  <span className="text-slate-400 text-[11px]">User: {l.user_name || 'System'}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{fmtDate(l.created_at)}</span>
              </div>
            ))}
            {!filteredLogs.length && (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching audit records found.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <GraduationCap size={15} className="text-emerald-400" />
          IDEA Lab · Semester V · PassportHub
        </div>
        <p className="text-[11px] text-slate-400">
          QR digital product passports · SHA-256 hash-linked lifecycle records · PGlite zero-setup storage
        </p>
      </div>
    </footer>
  );
}

function AnimatedRoutes({ user, setUser }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-up flex-1">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:passportId" element={<Verify />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Login setUser={setUser} />} />
        <Route path="/products/:id" element={user ? <Product /> : <Login setUser={setUser} />} />
        <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Login setUser={setUser} />} />
      </Routes>
    </div>
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header user={user} setUser={setUser} />
      <AnimatedRoutes user={user} setUser={setUser} />
      <Footer />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
