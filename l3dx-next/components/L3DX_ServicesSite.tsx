"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Printer,
  Boxes,
  Wrench,
  Mail,
  Upload,
  Link as LinkIcon,
  Calculator,
  CheckCircle2,
  HelpCircle,
  Shield,
  Palette,
  Sun,
  RefreshCcw,
  Euro,
  Hammer,
  Layers,
  Moon,
} from "lucide-react";

// 👉 Един файл = цял сайт. Готов за вграждане в Next.js/CRA/Vite или за export като статична страница.
// Стил: Tailwind (вграден в средата), семпъл, четим. Тема: синьо + златисто според логото L3DX.
// Текстът е на български. Марката: L3DX. Имейл: l3dx@abv.bg. Домейн: l3dx.bg.

// ==== Бранд цветове (по логото) ====
// Ако имаш точни HEX кодове, ще ги сменя. Засега използвам приятни нюанси:
const BRAND = {
  blueStart: "#0E4EC5",
  blueEnd: "#1E66F5",
  gold: "#F2B01E",
};

// CSS като един низ, за да избегнем проблеми с JSX парсера
const themeCSS = `
  html{ scroll-behavior:smooth; }
  :root{ --brand-blue-start:${BRAND.blueStart}; --brand-blue-end:${BRAND.blueEnd}; --brand-accent:${BRAND.gold}; }
  .brand-gradient{ background-image: linear-gradient(135deg, var(--brand-blue-start), var(--brand-blue-end)); }
  .btn-primary{ background: var(--brand-accent); color: #111; border-radius: 0.75rem; padding: 0.5rem 0.75rem; }
  .btn-primary:hover{ filter: brightness(0.95); }
  .btn-outline{ border: 1px solid var(--brand-accent); color: var(--brand-accent); border-radius: 0.75rem; padding: 0.5rem 0.75rem; background: transparent; }
  .btn-outline:hover{ background: rgba(242,176,30,0.08); }
  .brand-chip{ border-color: rgba(242,176,30,0.5) !important; color: #111; background: rgba(242,176,30,0.06); }
  .brand-card{ border-color: rgba(30,102,245,0.18) !important; }
  .brand-link{ color: var(--brand-accent); }
  .nav-link{ opacity:0.9; }
  .nav-link.active{ color: var(--brand-accent); font-weight:600; }
`;

// Лого: по подразбиране търси файл от public/logo.jpg. Ако липсва или гръмне зареждането — пада обратно към вграденото data URI.
const LOGO_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCA" +
  "gMCAgMECAgMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIU" +
  "FRUV/2wBDAQMEBAUEBQoHBwUUFBIUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ" +
  "UFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAHQAAAQQDAQAAAAAAAAAAAA" +
  "AAAAwABAgQFBwYICf/EAFMQAAIBAwMDAwUGBAQEBgYDAAECAwAEEQUSITFBBhMiUWFxgZEUoQdy" +
  "gZEHFCNScoKSorLB0fAzU3OTkpPCFjNDotNEVGOT/8QAGgEBAQEBAQEBAAAAAAAAAAAAAAECAwQF" +
  "Bv/EACMRAQEAAgIDAQEBAQAAAAAAAAABAhESIMEDE0EiMkH/2gAMAwEAAhEDEQA/APqgAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

// Снимка на принтера — използвай публичен URL или път до файл в /public (напр. "/P1.jpg").
// Поддържа и глобална променлива window.L3DX_PRINTER_IMG (str), ако искаш да я инжектираш от външен скрипт.
const PRINTER_IMG =
  typeof window !== "undefined" && (window as any).L3DX_PRINTER_IMG
    ? ((window as any).L3DX_PRINTER_IMG as string)
    : "/P1.jpg"; // TODO: смени с реален URL/път при деплой

// Константи за ценообразуване (по подразбиране — можеш да ги редактираш отдолу в UI)
const FIXED_EUR_RATE = 1.95583; // официален фиксиран курс BGN→EUR

const DEFAULT_PRICES_BG = {
  materials: {
    PLA: 0.05, // лв/г
    PETG: 0.07,
    ABS: 0.07,
    ASA: 0.08,
    TPU: 0.12,
  },
  machineHour: 1.0, // лв/час машинно време
  laborHour: 12.0, // лв/час ръчна работа (подготовка/следобработка)
  minOrder: 10.0, // минимална стойност на поръчка в лева
};

function BrandTheme() {
  return <style jsx global>{themeCSS}</style>;
}

function Currency({ bgn }: { bgn: number }) {
  const eur = bgn / FIXED_EUR_RATE;
  return (
    <span className="tabular-nums">
      {bgn.toFixed(2)} лв <span className="opacity-60">/ €{eur.toFixed(2)}</span>
    </span>
  );
}

// Показва стойности с единица (напр. лв/г) едновременно в BGN и EUR
function CurrencyUnit({ bgn, unit }: { bgn: number; unit?: string }) {
  const eur = bgn / FIXED_EUR_RATE;
  return (
    <span className="tabular-nums">
      {bgn.toFixed(2)} лв{unit ? `/${unit}` : ""} <span className="opacity-60">/ €{eur.toFixed(2)}{unit ? `/${unit}` : ""}</span>
    </span>
  );
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-base md:text-lg opacity-80 max-w-3xl">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

const SECTIONS = [
  { id: "services", label: "Услуги" },
  { id: "materials", label: "Материали" },
  { id: "pricing", label: "Цени" },
  { id: "order", label: "Поръчка" },
  { id: "faq", label: "ЧЗВ" },
  { id: "contacts", label: "Контакти" },
];

function Nav() {
  const [active, setActive] = useState<string>("services");
  const [logoSrc, setLogoSrc] = useState<string>("/logo.jpg"); // опит за public/logo.jpg с fallback към LOGO_DATA_URL
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  // при смяна на тема — добавя/махa "dark" клас и пази в localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  // възстановяване на тема от localStorage
  useEffect(() => {
    try {
      const t = localStorage.getItem("theme");
      if (t === "dark") setDark(true);
      if (t === "light") setDark(false);
    } catch {}
  }, []);

  // подсветка на активната секция при скрол
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible && (visible.target as HTMLElement).id)
          setActive((visible.target as HTMLElement).id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const NavLinks = ({ className = "" }: { className?: string }) => (
    <>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`nav-link hover:opacity-80 ${active === s.id ? "active" : ""} ${className}`}
          onClick={() => setOpen(false)}
        >
          {s.label}
        </a>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-transparent brand-gradient text-white shadow">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2 font-bold text-xl">
          <img
            src={logoSrc}
            onError={() => setLogoSrc(LOGO_DATA_URL)}
            alt="L3DX"
            className="h-8 w-8 rounded-full ring-1 ring-white/30 object-cover"
          />
          <span>L3DX</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLinks />
          <div className="h-5 w-px bg-white/20" />
          <button
            onClick={() => setDark(!dark)}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border border-white/30 hover:bg-white/10"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden lg:inline">Тема</span>
          </button>
          <a href="#order" className="inline-flex items-center gap-2 text-sm btn-primary">
            <Printer className="h-4 w-4" /> Поръчай
          </a>
        </nav>
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border border-white/30"
        >
          Меню
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/20 bg-black/10">
          <div className="px-4 py-3 flex flex-col gap-2">
            <NavLinks className="py-2" />
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setDark(!dark)}
                className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border border-white/30"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                Тема
              </button>
              <a href="#order" className="inline-flex items-center gap-2 text-sm btn-primary">
                <Printer className="h-4 w-4" /> Поръчай
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pt-16 md:pt-24 pb-10 md:pb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border brand-chip mb-3">
              <CheckCircle2 className="h-3.5 w-3.5" /> Бързи срокове • Високо качество • Двувалутни цени (BGN/€)
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
              3D принтиране по поръчка от <span className="underline decoration-2 underline-offset-4">L3DX</span>
            </h1>
            <p className="mt-4 text-lg opacity-90 max-w-2xl">
              Превръщаме вашите идеи и модели в реални продукти. Работим с PLA, PETG, ABS, ASA, TPU и др. Приемаме и само линк
              към модел от платформи като Printables, Thingiverse, MakerWorld.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#order" className="inline-flex items-center gap-2 btn-primary">
                <Upload className="h-4 w-4" /> Изпрати модел / линк
              </a>
              <a href="#pricing" className="inline-flex items-center gap-2 btn-outline">
                <Calculator className="h-4 w-4" /> Калкулатор на цена
              </a>
            </div>
          </div>
          <div className="relative">
            <figure className="rounded-3xl overflow-hidden border brand-card bg-black/5">
              <img src={PRINTER_IMG} alt="Нашият 3D принтер" loading="lazy" className="w-full h-auto object-cover" />
            </figure>
            <p className="mt-3 text-xs opacity-70">Реалният принтер, с който работим.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const items = [
    {
      icon: Printer,
      title: "3D печат по поръчка",
      desc:
        "Изпратете STL/3MF и ще предложим най-подходящия материал, слой и запълване според приложението.",
    },
    {
      icon: LinkIcon,
      title: "Печат на файлове от интернет",
      desc:
        "Нямате модел? Изпратете линк от Printables / Thingiverse / MakerWorld и ние ще се погрижим за останалото.",
    },
    {
      icon: Boxes,
      title: "Единични и малки серии",
      desc:
        "От единични бройки до кратки серии за прототипи, резервни части, RC/авто аксесоари, подаръци и др.",
    },
    {
      icon: Wrench,
      title: "Консултация и съдействие",
      desc:
        "Помагаме с избор на материал, мащаб, толеранси, резби, вложки, ориентация и следобработка.",
    },
  ];

  return (
    <Section
      id="services"
      title="Услуги"
      subtitle="Гъвкави, бързи и на разумни цени — по подобие на популярните услуги на пазара, с акцент върху персонализацията."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-2xl border brand-card p-5">
            <Icon className="h-7 w-7" />
            <h3 className="mt-3 font-semibold text-lg">{title}</h3>
            <p className="mt-2 text-sm opacity-80">{desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Materials() {
  const mats = [
    { name: "PLA", note: "Декорации, прототипи, ниско натоварване", icon: Palette },
    { name: "PETG", note: "Функционални части, умерена температура (до ~80°C)", icon: Shield },
    { name: "ABS", note: "Здравина, следобработка с ацетон, устойчивост", icon: Hammer },
    { name: "ASA", note: "UV устойчивост за външна среда", icon: Sun },
    { name: "TPU", note: "Гъвкави детайли, омекотители", icon: RefreshCcw },
  ];

  return (
    <Section id="materials" title="Материали" subtitle="Подбираме материала според целта — декоративно, функционално, за вън или с гъвкавост.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {mats.map((m) => (
          <div key={m.name} className="rounded-2xl border brand-card p-5">
            <m.icon className="h-7 w-7" />
            <h3 className="mt-3 font-semibold">{m.name}</h3>
            <p className="mt-2 text-sm opacity-80">{m.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm opacity-70">
        * Предлагаме и по-специални пластмаси при запитване (напр. усилени с влакна). Толеранси по подразбиране: ±0.2 мм за
        стандартни детайли.
      </p>
    </Section>
  );
}

// Помощна функция: парсва инпут низ → неотрицателно число. Празен низ → 0.
function parseInputNumber(s: string): number {
  if (s == null || s.trim() === "") return 0;
  const n = Number(String(s).replace(",", "."));
  if (!isFinite(n) || n < 0) return 0;
  return n;
}

function Pricing() {
  const [pricesBG, setPricesBG] = useState(DEFAULT_PRICES_BG);
  // 👉 Държим стойностите като НИЗОВЕ, за да позволим празно поле ("") без автоматично "0"
  const [mat, setMat] = useState<keyof typeof DEFAULT_PRICES_BG.materials>("PLA");
  const [gramsStr, setGramsStr] = useState("150");
  const [machineHStr, setMachineHStr] = useState("5");
  const [laborHStr, setLaborHStr] = useState("0");
  const [rush, setRush] = useState(false);

  const materialPrice = pricesBG.materials[mat];

  const result = useMemo(() => {
    const grams = parseInputNumber(gramsStr);
    const machineH = parseInputNumber(machineHStr);
    const laborH = parseInputNumber(laborHStr);

    const materialCost = grams * materialPrice;
    const machineCost = machineH * pricesBG.machineHour;
    const laborCost = laborH * pricesBG.laborHour;
    let total = materialCost + machineCost + laborCost;
    if (rush) total *= 1.25; // експрес 25%
    if (total < pricesBG.minOrder) total = pricesBG.minOrder;
    const eur = total / FIXED_EUR_RATE;
    return {
      grams,
      machineH,
      laborH,
      materialCost,
      machineCost,
      laborCost,
      total,
      eur,
    };
  }, [gramsStr, machineHStr, laborHStr, rush, materialPrice, pricesBG]);

  return (
    <Section
      id="pricing"
      title="Цени"
      subtitle="Двувалутно показване (BGN/€) с фиксиран курс. Калкулаторът е ориентировъчен — точна оферта изпращаме след преглед на модела."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Таблица със ставки */}
        <div className="lg:col-span-1 rounded-2xl border brand-card p-5">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Euro className="h-5 w-5" /> Базови ставки
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            {Object.entries(pricesBG.materials).map(([name, val]) => (
              <div key={name} className="flex items-center justify-between">
                <span>{name}</span>
                <span className="font-medium tabular-nums">
                  <CurrencyUnit bgn={val} unit="г" />
                </span>
              </div>
            ))}
            <div className="h-px bg-neutral-900/10 dark:bg-white/10 my-2" />
            <div className="flex items-center justify-between">
              <span>Машинно време</span>
              <span className="font-medium tabular-nums">
                <CurrencyUnit bgn={pricesBG.machineHour} unit="ч" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ръчна работа</span>
              <span className="font-medium tabular-nums">
                <CurrencyUnit bgn={pricesBG.laborHour} unit="ч" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Минимална поръчка</span>
              <span className="font-medium tabular-nums">
                <CurrencyUnit bgn={pricesBG.minOrder} />
              </span>
            </div>
            <p className="mt-3 text-xs opacity-70">
              Пълната цена зависи от сложност, следобработка, материални премии и срок.
            </p>
          </div>
        </div>

        {/* Калкулатор */}
        <div className="lg:col-span-2 rounded-2xl border brand-card p-5">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" /> Калкулатор
          </h3>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <label className="grid gap-1">
              Материал
              <select
                value={mat}
                onChange={(e) => setMat(e.target.value as any)}
                className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
              >
                {Object.keys(pricesBG.materials).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              Грамаж (г)
              <input
                type="number"
                min={0}
                value={gramsStr}
                onChange={(e) => setGramsStr(e.target.value)}
                className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
              />
            </label>
            <label className="grid gap-1">
              Машинно време (ч)
              <input
                type="number"
                min={0}
                value={machineHStr}
                onChange={(e) => setMachineHStr(e.target.value)}
                className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
              />
            </label>
            <label className="grid gap-1">
              Ръчна работа (ч)
              <input
                type="number"
                min={0}
                value={laborHStr}
                onChange={(e) => setLaborHStr(e.target.value)}
                className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
              />
            </label>
            <label className="inline-flex items-center gap-2 mt-2">
              <input type="checkbox" checked={rush} onChange={(e) => setRush(e.target.checked)} /> Експрес (+25%)
            </label>
          </div>

          <div className="mt-5 grid md:grid-cols-4 gap-3 text-sm">
            <div className="rounded-xl border brand-card p-3">
              Материал: <span className="font-semibold"><Currency bgn={result.materialCost} /></span>
            </div>
            <div className="rounded-xl border brand-card p-3">
              Машинно време: <span className="font-semibold"><Currency bgn={result.machineCost} /></span>
            </div>
            <div className="rounded-xl border brand-card p-3">
              Ръчна работа: <span className="font-semibold"><Currency bgn={result.laborCost} /></span>
            </div>
            <div className="rounded-xl border brand-card p-3 bg-neutral-50 dark:bg-white/5">
              Общо: <span className="font-semibold text-lg"><Currency bgn={result.total} /></span>
            </div>
          </div>

          <p className="mt-3 text-xs opacity-70">
            Пример: 150 г, 5 ч, без ръчна работа, PLA → виж изчислението по-горе. Минималната поръчка може да се приложи.
          </p>

          {/* Админ панел за бърза промяна на ставки */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm opacity-80">Промени ставки (админ)</summary>
            <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
              {Object.keys(pricesBG.materials).map((name) => (
                <label key={name} className="grid gap-1">
                  {name} (лв/г)
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={(pricesBG.materials as any)[name]}
                    onChange={(e) =>
                      setPricesBG((p) => ({
                        ...p,
                        materials: { ...p.materials, [name]: Number(e.target.value) },
                      }))
                    }
                    className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
                  />
                </label>
              ))}
              <label className="grid gap-1">
                Машинно време (лв/ч)
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={pricesBG.machineHour}
                  onChange={(e) => setPricesBG((p) => ({ ...p, machineHour: Number(e.target.value) }))}
                  className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
                />
              </label>
              <label className="grid gap-1">
                Ръчна работа (лв/ч)
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={pricesBG.laborHour}
                  onChange={(e) => setPricesBG((p) => ({ ...p, laborHour: Number(e.target.value) }))}
                  className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
                />
              </label>
              <label className="grid gap-1">
                Минимална поръчка (лв)
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={pricesBG.minOrder}
                  onChange={(e) => setPricesBG((p) => ({ ...p, minOrder: Number(e.target.value) }))}
                  className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
                />
              </label>
            </div>
          </details>
        </div>
      </div>
    </Section>
  );
}

function Order() {
  return (
    <Section id="order" title="Поръчка" subtitle="Изпратете линк към модела или кратко описание. Ще се върнем с оферта и срок.">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border brand-card p-5">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" /> Форма за запитване
          </h3>
          <form className="mt-4 grid gap-3 text-sm" onSubmit={(e) => e.preventDefault()}>
            <label className="grid gap-1">
              Име
              <input
                className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
                placeholder="Иван Иванов"
              />
            </label>
            <label className="grid gap-1">
              Имейл
              <input
                className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
                placeholder="you@example.com"
              />
            </label>
            <label className="grid gap-1">
              Линк към модел
              <input
                className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
                placeholder="https://www.printables.com/..."
              />
            </label>
            <label className="grid gap-1">
              Описание
              <textarea
                rows={4}
                className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-transparent px-3 py-2"
                placeholder="Материал, цвят, размер, изисквания, срок..."
              />
            </label>
            <div className="flex items-center justify-between">
              <p className="text-xs opacity-70">* Може да изпратите и директно имейл с файлове/линк.</p>
              <a
                href="mailto:l3dx@abv.bg?subject=Запитване%20за%203D%20печат%20(L3DX)"
                className="inline-flex items-center gap-2 btn-primary"
              >
                <Mail className="h-4 w-4" /> Изпрати имейл
              </a>
            </div>
          </form>
        </div>
        <div className="rounded-2xl border brand-card p-5">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" /> Политики
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• Персонализирани стоки (по заявка) са извън обхвата на 14-дневния отказ за онлайн покупки.</li>
            <li>• Рекламации: покриваме дефекти от изработка; дизайнът на модела е отговорност на клиента.</li>
            <li>• За поръчки над определена сума може да изискаме аванс (30–50%).</li>
            <li>• Данъчни документи според начина на плащане.</li>
          </ul>
          <p className="mt-3 text-xs opacity-70">
            Пълни Общи условия и Политика за лични данни ще бъдат публикувани на l3dx.bg.
          </p>
        </div>
      </div>
    </Section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Как да избера материал?",
      a: "Най-общо: PLA за демонстрационни модели; PETG/ASA за функционални детайли; ABS за здравина и следобработка; TPU за гъвкавост. При съмнение — пишете ни.",
    },
    {
      q: "Мога ли да пратя само линк?",
      a: "Да. Изпратете линк от Printables/Thingiverse/MakerWorld/Thangs и ние ще оценим печата и ще дадем оферта.",
    },
    {
      q: "Как се формира цената?",
      a: "Комбинация от грамове × ставка/г, машинно време × лв/ч, ръчна работа и опционални добавки (експрес, следобработка, специални материали).",
    },
    {
      q: "Какво е времето за изпълнение?",
      a: "Типично 1–3 работни дни за единични детайли. По-сложни/серийни поръчки — според натоварването.",
    },
  ];

  return (
    <Section id="faq" title="Често задавани въпроси">
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {faqs.map((f) => (
          <details key={f.q} className="rounded-2xl border brand-card p-5">
            <summary className="cursor-pointer font-medium flex items-center gap-2">
              <HelpCircle className="h-5 w-5" /> {f.q}
            </summary>
            <p className="mt-3 text-sm opacity-80">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Contacts() {
  return (
    <Section id="contacts" title="Контакти" subtitle="Работим онлайн за цяла България. За въпроси и оферти — пишете ни.">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border brand-card p-5">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" /> Имейл
          </h3>
          <a href="mailto:l3dx@abv.bg" className="mt-2 inline-block underline underline-offset-4 brand-link">
            l3dx@abv.bg
          </a>
          <p className="mt-3 text-sm opacity-80">Може да изпратите и директно файлове (STL/3MF) или линк към модела.</p>
        </div>
        <div className="rounded-2xl border brand-card p-5">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" /> L3DX
          </h3>
          <p className="mt-2 text-sm opacity-80">l3dx.bg — услуги за 3D принтиране и дизайн. База: Варна (работим изцяло онлайн).</p>
          <p className="mt-2 text-xs opacity-60">
            Авторски права върху моделите са собственост на техните притежатели. Приемаме поръчки при спазване на IP правилата.
          </p>
        </div>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-900/10 dark:border-white/10 py-10">
      <div className="mx-auto max-w-7xl px-4 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="opacity-70">© {new Date().getFullYear()} L3DX • Всички права запазени</p>
        <div className="opacity-70">Цени в BGN и EUR (1 EUR = 1.95583 BGN)</div>
      </div>
    </footer>
  );
}

// ===== Мини тестове / диагностика (само в dev режим) =====
function Diagnostics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("dev") === "1") setEnabled(true);
    }
  }, []);

  if (!enabled) return null;

  type Test = { name: string; pass: boolean; details?: string };

  const approx = (a: number, b: number, eps = 1e-3) => Math.abs(a - b) < eps;
  const isRenderable = (C: any) => {
    try { return !!C && React.isValidElement(React.createElement(C as any)); } catch { return false; }
  };

  // Допълнителни малки тестове за регресии
  const sampleCalcTotalBGN = (() => {
    const grams = 150; // г
    const material = DEFAULT_PRICES_BG.materials.PLA; // 0.05 лв/г
    const machine = 5 * DEFAULT_PRICES_BG.machineHour; // 5 лв
    const labor = 0;
    let total = grams * material + machine + labor; // 7.5 + 5 = 12.5 лв
    if (total < DEFAULT_PRICES_BG.minOrder) total = DEFAULT_PRICES_BG.minOrder;
    return total; // 12.5
  })();

  const tests: Test[] = [
    {
      name: "unit: 0.05 BGN/g ≈ €0.0256/g",
      pass: approx(0.05 / FIXED_EUR_RATE, 0.02556, 1e-3),
      details: `≈ €${(0.05 / FIXED_EUR_RATE).toFixed(4)}/g`,
    },
    {
      name: "icons: Printer renderable",
      pass: isRenderable(Printer),
    },
    {
      name: "currency: 19.5583 BGN ≈ €10.00",
      pass: approx(19.5583 / FIXED_EUR_RATE, 10.0, 1e-2),
      details: `€${(19.5583 / FIXED_EUR_RATE).toFixed(2)}`,
    },
    {
      name: "assets: PRINTER_IMG string",
      pass: typeof PRINTER_IMG === "string" && PRINTER_IMG.length > 0,
    },
    {
      name: "calc: sample total BGN == 12.5",
      pass: approx(sampleCalcTotalBGN, 12.5, 1e-6),
      details: `${sampleCalcTotalBGN.toFixed(2)} лв`,
    },
    {
      name: "style: themeCSS contains --brand-accent",
      pass: typeof themeCSS === "string" && themeCSS.includes("--brand-accent"),
    },
    {
      name: "dom: sections present",
      pass: typeof document !== "undefined" && SECTIONS.every((s) => !!document.getElementById(s.id)),
    },
    {
      name: "logo: inline data url fallback looks valid",
      pass: LOGO_DATA_URL.startsWith("data:image/"),
    },
    {
      name: "parser: empty input parses to 0",
      pass: parseInputNumber("") === 0 && parseInputNumber("   ") === 0,
    },
  ];

  const allOk = tests.every((t) => t.pass);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className={`rounded-2xl border p-5 ${allOk ? "border-emerald-400/50" : "border-red-400/50"}`}>
        <h3 className="font-semibold mb-3">Тестове (dev)</h3>
        <ul className="space-y-2 text-sm">
          {tests.map((t) => (
            <li key={t.name}>
              <span className={`inline-block min-w-16 text-center rounded px-2 py-0.5 mr-2 text-xs ${t.pass ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600"}`}>{t.pass ? "PASS" : "FAIL"}</span>
              {t.name} {t.details ? <span className="opacity-60">— {t.details}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function L3DX_ServicesSite() {
  return (
    <main className="text-neutral-900 dark:text-neutral-200 bg-white dark:bg-neutral-900">
      <BrandTheme />
      <Nav />
      <Hero />
      <Services />
      <Materials />
      <Pricing />
      <Order />
      <FAQ />
      <Contacts />
      <Footer />
      <Diagnostics />
      {/* Sticky CTA */}
      <a href="#order" className="fixed bottom-5 right-5 inline-flex items-center gap-2 btn-primary shadow-lg">
        <Printer className="h-4 w-4" /> Поръчай печат
      </a>
    </main>
  );
}
