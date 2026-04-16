const fs = require('fs');
let content = fs.readFileSync('src/pages/TVDashboard.jsx', 'utf8');
content = content.replace(/bg-brand-gray/g, 'bg-[#F3F4F6]');
content = content.replace(/bg-brand-red/g, 'bg-[#DC2626]');
content = content.replace(/text-brand-red/g, 'text-[#DC2626]');
content = content.replace(/border-brand-red/g, 'border-[#DC2626]');
content = content.replace(/text-slate-900/g, 'text-[#0A0A0A]');
content = content.replace(/text-slate-800/g, 'text-[#0A0A0A]');
content = content.replace(/text-slate-700/g, 'text-[#0A0A0A]');
content = content.replace(/text-slate-600/g, 'text-[#4B5563]');
content = content.replace(/text-slate-500/g, 'text-[#4B5563]');
content = content.replace(/text-slate-400/g, 'text-[#6B7280]');
content = content.replace(/text-\[#6B7280\] uppercase/g, 'text-[#4B5563] uppercase');
content = content.replace(/border-slate-100/g, 'border-[#E5E7EB]');
content = content.replace(/border-slate-200/g, 'border-[#E5E7EB]');
content = content.replace(/border-slate-50/g, 'border-[#E5E7EB]');
content = content.replace(/text-amber-400/g, 'text-[#F59E0B]');
content = content.replace(/#d71920/g, '#DC2626');
content = content.replace(/#334155/g, '#0A0A0A');
content = content.replace(/colors=\{\{ primary: "#475569", secondary: "#DC2626" \}\}/g, 'colors={{ primary: "#0A0A0A", secondary: "#DC2626" }}');
content = content.replace(/text-\[([0-9.]+)vh\]/g, (match, sizeStr) => {
    let size = parseFloat(sizeStr);
    if (size >= 3.0) { size = size * 1.15; } else { size = size * 1.08; }
    let formatted = size.toFixed(1);
    if (formatted.endsWith('.0')) { formatted = formatted.substring(0, formatted.length - 2); }
    return `text-[${formatted}vh]`;
});
content = content.replace(/font-black/g, 'font-bold');
fs.writeFileSync('src/pages/TVDashboard.jsx', content);
console.log('Done');
