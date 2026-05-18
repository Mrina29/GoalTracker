import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  // Layout and Backgrounds
  [/background: ?"#f8fafc"/gi, 'background:"#020617", color:"#e2e8f0"'],
  [/background: ?"#fff"/gi, 'background:"#0f172a"'],
  [/background: ?"#ffffff"/gi, 'background:"#0f172a"'],
  [/background: ?"#f9fafb"/gi, 'background:"#0f172a"'],
  [/background: ?"#f3f4f6"/gi, 'background:"#1e293b"'],
  [/background: ?"#fef3c7"/gi, 'background:"#451a03"'],
  [/background: ?"#fee2e2"/gi, 'background:"#450a0a"'],
  [/background: ?"#dcfce7"/gi, 'background:"#064e3b"'],
  [/background: ?"#dbeafe"/gi, 'background:"#1e3a8a"'],
  [/background: ?"#ede9fe"/gi, 'background:"#064e3b"'],
  [/background: ?"#f0f0ff"/gi, 'background:"#064e3b"'],
  [/background: ?"#f0fdf4"/gi, 'background:"#064e3b"'],
  
  // Borders
  [/#e5e7eb/gi, '#1e293b'],
  [/#f3f4f6/gi, '#1e293b'],
  [/#c7d2fe/gi, '#064e3b'],
  [/#f9fafb/gi, '#1e293b'],
  [/#bfdbfe/gi, '#1e3a8a'],
  [/#bbf7d0/gi, '#047857'],
  [/#ddd6fe/gi, '#064e3b'],
  [/#fde68a/gi, '#78350f'],
  [/#fca5a5/gi, '#7f1d1d'],
  
  // Typography Dark Mode Inversions
  [/#111827/gi, '#f8fafc'], // Main text -> slate-50
  [/#374151/gi, '#e2e8f0'], // Sub text -> slate-200
  [/#6b7280/gi, '#94a3b8'], // Muted text -> slate-400
  [/#9ca3af/gi, '#64748b'], // Helper text -> slate-500
  [/#d1d5db/gi, '#475569'], // Divider
  
  // Accents & Colors (Indigo/Purple -> Emerald)
  [/#4f46e5/gi, '#10b981'], // Indigo -> Emerald-500
  [/#7c3aed/gi, '#059669'], // Purple -> Emerald-600
  [/#059669/gi, '#34d399'], // Green -> Emerald-400
  [/#15803d/gi, '#34d399'], // Dark green -> Emerald-400
  
  // Warning/Error Colors adjust for dark contrast
  [/#d97706/gi, '#fbbf24'],
  [/#b45309/gi, '#fcd34d'],
  [/#dc2626/gi, '#f87171'],
  [/#1d4ed8/gi, '#60a5fa'],
  [/#5b21b6/gi, '#34d399'],
  
  // Modals & Overlays
  [/background: ?"rgba\\(0,0,0,0\\.5\\)"/g, 'background:"rgba(2,6,23,0.85)", backdropFilter:"blur(6px)"'],
  
  // Border Radius for Bento Feel
  [/borderRadius: ?12/g, 'borderRadius:24'],
  [/borderRadius: ?10/g, 'borderRadius:16'],
  [/borderRadius: ?8/g, 'borderRadius:12'],
  
  // Gap and Padding to enhance Bento box aesthetics
  [/gap: ?14,/g, 'gap: 24,'],
  [/gap: ?10/g, 'gap: 16'],
  [/marginBottom: ?20/g, 'marginBottom: 24'],
  [/marginBottom: ?16/g, 'marginBottom: 24'],
  [/padding: ?"14px 16px"/g, 'padding:"24px 28px"'],
  [/padding: ?"16px 20px"/g, 'padding:"24px 28px"'],
  [/padding: ?"12px 16px"/g, 'padding:"20px 24px"'],

  // Sidebar width
  [/width: ?200/g, 'width: 240'],
  
  // Make un-themed app background dark
  [/linear-gradient\\(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%\\)/g, '"#020617"']
];

for (let [pattern, repl] of replacements) {
  code = code.replace(pattern, repl);
}

// Ensure the App container has correct color mappings (e.g. font-sans)
// Add drop shadow to sections and stat cards
code = code.replace(/background:"#0f172a", border:"1px solid #1e293b", borderRadius:24/g, 'background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)"');

// Also apply drop shadow to the login box
code = code.replace(/boxShadow:"0 40px 80px rgba\\(0,0,0,0\\.4\\)"/g, 'boxShadow:"0 40px 80px rgba(0,0,0,0.8)"');

// And modals
code = code.replace(/boxShadow:"0 25px 60px rgba\\(0,0,0,0\\.2\\)"/g, 'boxShadow:"0 25px 60px rgba(0,0,0,0.8)"');

// Hide Sidebar border for Bento feel
code = code.replace(/borderRight:"1px solid #1e293b"/g, 'borderRight:"none"');

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx was successfully themified.');
