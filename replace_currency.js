const fs = require('fs');
const path = require('path');

// Determine the target directory relative to this script
const targetDir = path.join(__dirname, 'fe-fintrix/src/pages/user');

// Check if a specific file was passed as an argument
const specificFile = process.argv[2];

let files = [];
if (specificFile) {
  // If argument is just the filename, join with targetDir
  const filePath = specificFile.includes('/') || specificFile.includes('\\') 
    ? path.resolve(specificFile) 
    : path.join(targetDir, specificFile);
  
  if (fs.existsSync(filePath)) {
    files = [filePath];
  } else {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }
} else {
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Target directory not found at ${targetDir}`);
    process.exit(1);
  }
  files = fs.readdirSync(targetDir)
    .filter(f => f.endsWith('.jsx'))
    .map(f => path.join(targetDir, f));
}

files.forEach(p => {
  const file = path.basename(p);
  let content = fs.readFileSync(p, 'utf-8');
  let changed = false;

  // Skip files that should handle their own logic or are already complex
  if (['SettingsPage.jsx', 'DashboardPage.jsx', 'TransactionsPage.jsx'].includes(file)) {
     console.log(`Skipping ${file} (manual handling required or already implemented)`);
     return;
  }

  // 1. Add useAuth import if missing
  if (!content.includes('useAuth')) {
    if (content.match(/import {.*?useAuth.*?}/)) {
        // already imported in some form
    } else {
        content = content.replace(/(import React.*?;\n)/, '$1import { useAuth } from "../../context/AuthContext.jsx";\n');
        changed = true;
    }
  }

  // 2. Inject t and formatUang inside the main component definition
  if (!content.includes('const { user } = useAuth()') || !content.includes('const formatUang')) {
    // Find the main component function (e.g. function AnalyticsPage() { )
    const compMatch = content.match(/function\s+([A-Z][a-zA-Z0-9_]+)\s*\(\)\s*\{/);
    if (compMatch) {
      const funcDef = compMatch[0];
      // Only inject if not already there
      if (!content.includes('const formatUang')) {
          const injection = `${funcDef}\n  const { user } = useAuth();\n  const t = (en, id) => user?.language === 'id' ? id : en;\n  const formatUang = (angka) => {\n    const curr = user?.currency || 'USD';\n    const lang = user?.language === 'id' ? 'id-ID' : 'en-US';\n    try {\n      return new Intl.NumberFormat(lang, { style: 'currency', currency: curr, minimumFractionDigits: (curr === 'IDR' || curr === 'JPY') ? 0 : 2, maximumFractionDigits: (curr === 'IDR' || curr === 'JPY') ? 0 : 2 }).format(angka || 0);\n    } catch { return \`\${curr} \${(angka || 0).toLocaleString()}\`; }\n  };\n`;
          content = content.replace(funcDef, injection);
          changed = true;
      }
    }
  }

  // 3. Simple UI translations for common headers
  const translations = [
    { en: 'Analytics', id: 'Analitik' },
    { en: 'Budget', id: 'Anggaran' },
    { en: 'Investment', id: 'Investasi' },
    { en: 'Reports', id: 'Laporan' },
    { en: 'Notifications', id: 'Notifikasi' }
  ];

  translations.forEach(({en, id}) => {
    const regex = new RegExp(`>(${en})<`, 'g');
    if (content.match(regex)) {
        content = content.replace(regex, `>{t("${en}", "${id}")}<`);
        changed = true;
    }
  });

  // 4. Currency formatting replacements
  // Replace string concat dollar like `$${summary.balance}` with {formatUang(summary.balance)}
  if (content.includes('`$${')) {
      content = content.replace(/`\$\$\{(.*?)\}`/g, '{formatUang($1)}');
      changed = true;
  }
  
  // Replace plain "$ " prefix patterns if any
  if (content.includes('"$ " +')) {
    content = content.replace(/"\$ " \+ (.*?)(\s|\)|;|,)/g, 'formatUang($1)$2');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, content, 'utf-8');
    console.log(`Successfully processed ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
});

