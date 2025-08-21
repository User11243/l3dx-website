"use client";


import React, { useMemo, useState, useEffect } from "react";
import {
Box,
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


// Вградено лого като data URL (временно). Ще го заменим с PNG/SVG файл, когато качиш логото на хостинг.
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
return (
<style>{`
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
