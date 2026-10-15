import './style.css';
import { analyze, labels } from './analyze.js';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';

const copy = {
  en: {
    nav: 'A clearer path to your next role.', badge: 'PRIVATE RESUME REVIEW', headline: 'Make every word', headline2: 'work harder.', intro: 'See how readable your resume is, find what’s missing, and make a stronger first impression. No uploads to a server. No guesswork.', privacy: 'Your resume stays on this device', step: '01 / START HERE', start: 'Let’s look at your resume.', startSub: 'Upload a file and we’ll map out what’s working and what needs attention.', drop: 'Drop your resume here', browse: 'or click to browse files', files: 'PDF, DOCX, TXT or MD · up to 10 MB', name: 'YOUR NAME', namePlace: 'e.g. Alex Rivera', country: 'TARGET COUNTRY', countryPlace: 'e.g. United States', role: 'TARGET ROLE', rolePlace: 'e.g. Product Designer', language: 'RESUME LANGUAGE', auto: 'Auto detect', optional: 'JOB DESCRIPTION', optionalHint: 'Optional · paste a job posting to check role-specific keywords', jobPlace: 'Paste the job description here...', button: 'Analyze my resume', processing: 'Reading your resume…', sample: 'See a sample review', local: 'Private by design', localText: 'Files are processed in your browser. Nothing gets sent to a server.', clear: 'Actionable, not arbitrary', clearText: 'Plain-language checks and practical fixes you can apply today.', flexible: 'Built for your next move', flexibleText: 'Review your CV and save a clean revision or report.', disclaimer: 'A practical readability check, not a guarantee of passing any employer’s ATS.', results: 'YOUR REVIEW', resultsTitle: 'A clearer picture of your resume.', demo: 'Sample review · upload your own CV for personalized results.', score: 'OVERALL READABILITY', strong: 'Looking good', improve: 'Room to improve', revisit: 'Needs attention', scoreNote: 'Based on detected sections, contact info and text clarity — not a real ATS score.', breakdown: 'Section by section', breakdownSub: 'Where your resume stands today.', matched: 'KEYWORDS FOUND', missing: 'POTENTIAL GAPS', keywords: 'Role-specific keywords', fixes: 'Your next steps', preview: 'Extracted resume text', previewNote: 'Review the extracted text to confirm your file was read correctly.', docx: 'Download revised DOCX', pdf: 'Download PDF report', again: 'Analyze another', missingJob: 'Add a job description to compare your CV against role-specific terms.', revised: 'Revision scaffold: original text preserved; section headings normalized where detected. Review before applying.', required: 'Select a resume file to get started.', sizeError: 'File exceeds 10 MB. Choose a smaller file.', typeError: 'Unsupported file. Choose PDF, DOCX, TXT or MD.', readError: 'Could not read this file. Try a text-based PDF, DOCX, TXT or MD.', emptyError: 'No selectable text found. Scanned PDFs require OCR; use a text-based file.', footer: 'Make your experience easier to see.', footerNote: 'Private, on-device resume clarity tools.', languageLabel: 'Interface language'
  },
  id: {
    nav: 'Langkah lebih jelas menuju karier berikutnya.', badge: 'REVIEW CV PRIVAT', headline: 'Buat setiap kata', headline2: 'lebih berarti.', intro: 'Periksa keterbacaan CV, temukan bagian yang kurang, dan buat kesan pertama yang lebih kuat. Tanpa unggah ke server.', privacy: 'CV Anda tetap di perangkat ini', step: '01 / MULAI DI SINI', start: 'Mari periksa CV Anda.', startSub: 'Unggah file untuk melihat bagian yang sudah baik dan yang perlu diperbaiki.', drop: 'Letakkan CV di sini', browse: 'atau klik untuk memilih file', files: 'PDF, DOCX, TXT atau MD · maks. 10 MB', name: 'NAMA ANDA', namePlace: 'mis. Alex Rivera', country: 'NEGARA TUJUAN', countryPlace: 'mis. Indonesia', role: 'POSISI TUJUAN', rolePlace: 'mis. Desainer Produk', language: 'BAHASA CV', auto: 'Deteksi otomatis', optional: 'DESKRIPSI LOWONGAN', optionalHint: 'Opsional · tempel lowongan untuk mencocokkan kata kunci', jobPlace: 'Tempel deskripsi lowongan di sini...', button: 'Analisis CV saya', processing: 'Membaca CV Anda…', sample: 'Lihat contoh review', local: 'Privat sejak awal', localText: 'File diproses di browser. Tidak dikirim ke server.', clear: 'Saran yang bisa diterapkan', clearText: 'Pemeriksaan jelas dan perbaikan praktis untuk CV Anda.', flexible: 'Siap untuk langkah berikutnya', flexibleText: 'Periksa CV dan simpan revisi atau laporan.', disclaimer: 'Pemeriksaan keterbacaan praktis, bukan jaminan lolos ATS perusahaan.', results: 'HASIL REVIEW', resultsTitle: 'Gambaran CV yang lebih jelas.', demo: 'Contoh review · unggah CV Anda untuk hasil pribadi.', score: 'SKOR KETERBACAAN', strong: 'Sudah baik', improve: 'Perlu peningkatan', revisit: 'Perlu perhatian', scoreNote: 'Berdasarkan bagian, informasi kontak, dan kejelasan teks — bukan skor ATS sungguhan.', breakdown: 'Per bagian', breakdownSub: 'Kondisi CV Anda saat ini.', matched: 'KATA KUNCI DITEMUKAN', missing: 'YANG BELUM ADA', keywords: 'Kata kunci posisi', fixes: 'Langkah selanjutnya', preview: 'Teks CV yang terbaca', previewNote: 'Periksa teks hasil ekstraksi untuk memastikan file dibaca dengan benar.', docx: 'Unduh revisi DOCX', pdf: 'Unduh laporan PDF', again: 'Analisis CV lain', missingJob: 'Tambahkan deskripsi lowongan untuk membandingkan kata kunci posisi.', revised: 'Kerangka revisi: teks asli dipertahankan; judul bagian dinormalkan bila terdeteksi. Periksa sebelum digunakan.', required: 'Pilih file CV untuk mulai.', sizeError: 'File melebihi 10 MB. Pilih file lebih kecil.', typeError: 'Format tidak didukung. Pilih PDF, DOCX, TXT atau MD.', readError: 'File tidak dapat dibaca. Coba PDF berbasis teks, DOCX, TXT atau MD.', emptyError: 'Tidak ada teks yang bisa dipilih. PDF hasil scan perlu OCR; gunakan file berbasis teks.', footer: 'Buat pengalaman Anda lebih mudah dilihat.', footerNote: 'Alat keterbacaan CV privat di perangkat Anda.', languageLabel: 'Bahasa antarmuka'
  }
};

const icon = (name, size = 20) => {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', upload: '<path d="M12 16V4m-4 4 4-4 4 4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>', shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>', spark: '<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/>', document: '<path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v5h4M8 12h7M8 16h7"/>', check: '<path d="m5 12 4 4L19 6"/>', down: '<path d="m12 3 0 12m-5-5 5 5 5-5M4 18v2h16v-2"/>', close: '<path d="M18 6 6 18M6 6l12 12"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let lang = localStorage.getItem('cv-atlas-lang') === 'id' ? 'id' : 'en';
let report = null;
let file = null;
let isSample = false;
let details = { name: '', role: '', country: '', jd: '' };
const t = () => copy[lang];

function render() {
  document.documentElement.lang = lang;
  document.querySelector('#app').innerHTML = `
    <header class="site-header"><div class="container header-inner"><a href="#top" class="brand" aria-label="CV Atlas home"><span class="brand-mark">${icon('spark', 22)}</span><span>cv<span class="brand-accent">atlas</span><span class="brand-dot">.</span></span></a><div class="header-right"><span class="header-tagline">${t().nav}</span><div class="lang-toggle" role="group" aria-label="${t().languageLabel}"><button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button><button type="button" data-lang="id" aria-pressed="${lang === 'id'}">ID</button></div></div></div></header>
    <main id="top"><section class="hero container"><div class="hero-copy"><span class="eyebrow"><span class="eyebrow-line"></span>${t().badge}</span><h1>${t().headline}<br><em>${t().headline2}</em></h1><p>${t().intro}</p><div class="privacy-pill">${icon('shield', 17)} ${t().privacy}</div></div><div class="hero-art" aria-hidden="true"><div class="art-orbit orbit-1"></div><div class="art-orbit orbit-2"></div><div class="art-card"><div class="art-dots"><span></span><span></span><span></span></div><div class="art-avatar"></div><div class="art-line dark short"></div><div class="art-line mid"></div><div class="art-divider"></div><div class="art-line dark med"></div><div class="art-line"></div><div class="art-line long"></div><div class="art-line"></div><div class="art-divider"></div><div class="art-line dark med"></div><div class="art-line long"></div><div class="art-line mid"></div><div class="art-badge">${icon('check', 19)}</div></div><span class="art-star star-one">✳</span><span class="art-star star-two">✳</span></div></section>
    <section class="workspace container" id="workspace"><div class="section-top"><div><span class="eyebrow">${t().step}</span><h2>${t().start}</h2><p>${t().startSub}</p></div><span class="section-decoration" aria-hidden="true">✳</span></div><div class="workspace-grid"><form id="form" class="form-card" novalidate><label class="dropzone" id="dropzone"><input type="file" id="file" accept=".pdf,.docx,.txt,.md" aria-label="${t().drop}"/><span class="upload-icon">${icon('upload', 26)}</span><strong>${t().drop}</strong><span>${t().browse}</span><small>${t().files}</small></label><div class="file-selected" id="file-selected" hidden></div><div class="field-grid"><label class="field">${t().name}<input name="name" autocomplete="name" placeholder="${t().namePlace}" value="${esc(details.name)}" /></label><label class="field">${t().country}<input name="country" placeholder="${t().countryPlace}" value="${esc(details.country)}" /></label></div><label class="field role-field">${t().role}<input name="role" placeholder="${t().rolePlace}" value="${esc(details.role)}" /></label><details class="job-details" ${details.jd ? 'open' : ''}><summary>${t().optional}<span class="summary-plus">+</span></summary><p>${t().optionalHint}</p><textarea name="jd" placeholder="${t().jobPlace}" rows="5">${esc(details.jd)}</textarea></details><p class="error" id="error" role="alert" hidden></p><button class="primary-button" id="analyze" type="submit">${t().button} ${icon('arrow', 19)}</button><p class="form-footnote">${icon('shield', 15)} ${t().privacy}</p></form><aside class="aside-panel"><div class="aside-top"><span class="aside-symbol">${icon('spark', 22)}</span><span>THE CV ATLAS WAY</span></div><div class="benefit"><span class="benefit-number">01</span><div><h3>${t().local}</h3><p>${t().localText}</p></div></div><div class="benefit"><span class="benefit-number">02</span><div><h3>${t().clear}</h3><p>${t().clearText}</p></div></div><div class="benefit"><span class="benefit-number">03</span><div><h3>${t().flexible}</h3><p>${t().flexibleText}</p></div></div><button type="button" class="sample-link" id="sample">${t().sample} ${icon('arrow', 17)}</button></aside></div></section><section class="results container" id="results" aria-live="polite" ${report ? '' : 'hidden'}>${report ? resultMarkup() : ''}</section><section class="bottom-note container"><div class="bottom-symbol">${icon('spark', 28)}</div><p>${t().disclaimer}</p></section></main><footer class="site-footer"><div class="container footer-inner"><div class="brand footer-brand"><span class="brand-mark">${icon('spark', 22)}</span><span>cv<span class="brand-accent">atlas</span><span class="brand-dot">.</span></span></div><div><strong>${t().footer}</strong><span>${t().footerNote}</span></div><span class="footer-privacy">${icon('shield', 17)} ${t().privacy}</span></div></footer>`;
  bind();
}

function resultMarkup() {
  const r = report;
  const tone = r.score >= 80 ? 'good' : r.score >= 55 ? 'mid' : 'low';
  const sorted = [...r.results].sort((a, b) => a.score - b.score);
  return `<div class="results-heading"><div><span class="eyebrow">${t().results}</span><h2>${t().resultsTitle}</h2></div><button type="button" class="text-button" id="again">${t().again} ${icon('arrow', 17)}</button></div>${isSample ? `<div class="sample-banner">${icon('spark', 18)} ${t().demo}</div>` : ''}<div class="result-grid"><div class="score-card"><span class="card-kicker">${t().score}</span><div class="score-inner"><div class="score-ring ${tone}" style="--score:${r.score}"><div><strong>${r.score}</strong><small>/ 100</small></div></div><div><h3>${t()[tone === 'good' ? 'strong' : tone === 'mid' ? 'improve' : 'revisit']}</h3><p>${t().scoreNote}</p></div></div></div><div class="action-card"><span class="card-kicker">${t().fixes}</span><ol>${sorted.filter(x => x.score < 100).slice(0, 3).map(x => `<li>${esc(x.tip)}</li>`).join('') || `<li>${lang === 'id' ? 'Semua bagian utama ditemukan. Periksa kembali detail dan kesesuaian posisi.' : 'All main sections found. Review details and tailor to the role.'}</li>`}</ol></div></div><div class="breakdown-card"><div class="card-heading"><div><h3>${t().breakdown}</h3><p>${t().breakdownSub}</p></div><span>${r.results.length} ${lang === 'id' ? 'pemeriksaan' : 'checks'}</span></div><div class="breakdown-list">${r.results.map(item => `<div class="breakdown-row"><div class="breakdown-label"><span class="status-icon ${item.score >= 80 ? 'passed' : item.score >= 50 ? 'partial' : 'missing'}">${item.score >= 80 ? icon('check', 14) : '!'}</span><div><strong>${labels[lang][item.key]}</strong><small>${esc(item.detail)}</small></div></div><div class="breakdown-meter"><div class="meter-track"><span style="width:${item.score}%"></span></div><strong>${item.score}%</strong></div></div>`).join('')}</div></div><div class="result-bottom"><div class="keyword-card"><h3>${t().keywords}</h3>${r.keywords.length ? `<div class="keyword-group"><span>${t().matched}</span><div>${r.matched.map(w => `<span class="keyword found">${esc(w)}</span>`).join('') || '—'}</div></div><div class="keyword-group"><span>${t().missing}</span><div>${r.missing.map(w => `<span class="keyword absent">${esc(w)}</span>`).join('') || '—'}</div></div>` : `<p class="muted">${t().missingJob}</p>`}</div><div class="download-card"><span class="download-icon">${icon('document', 24)}</span><h3>${lang === 'id' ? 'Simpan hasil Anda' : 'Take your next step.'}</h3><p>${t().revised}</p><div class="download-buttons"><button type="button" id="download-docx" ${isSample ? 'disabled' : ''}>${icon('down', 17)} ${t().docx}</button><button type="button" id="download-pdf" ${isSample ? 'disabled' : ''}>${icon('down', 17)} ${t().pdf}</button></div></div></div><details class="preview"><summary>${t().preview}<span>+</span></summary><p>${t().previewNote}</p><pre>${esc(r.text.slice(0, 15000))}</pre></details>`;
}

function bind() {
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => {
    details = Object.fromEntries(new FormData(document.querySelector('#form')));
    lang = button.dataset.lang;
    localStorage.setItem('cv-atlas-lang', lang);
    if (report) report = analyze(report.text, details.jd || (isSample ? 'designer figma research collaboration' : ''), lang);
    render();
  }));
  const input = document.querySelector('#file');
  input.addEventListener('change', () => setFile(input.files[0]));
  const zone = document.querySelector('#dropzone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragging'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragging'); setFile(e.dataTransfer.files[0]); });
  if (file) showFile();
  document.querySelector('#form').addEventListener('submit', submit);
  document.querySelector('#sample').addEventListener('click', sample);
  document.querySelector('#again')?.addEventListener('click', () => { file = null; report = null; isSample = false; render(); document.querySelector('#workspace').scrollIntoView({ behavior: 'smooth' }); });
  document.querySelector('#download-docx')?.addEventListener('click', downloadDocx);
  document.querySelector('#download-pdf')?.addEventListener('click', downloadPdf);
}

function setFile(chosen) {
  if (!chosen) return;
  const error = document.querySelector('#error');
  if (!/\.(pdf|docx|txt|md)$/i.test(chosen.name)) { error.textContent = t().typeError; error.hidden = false; return; }
  if (chosen.size > 10 * 1024 * 1024) { error.textContent = t().sizeError; error.hidden = false; return; }
  file = chosen;
  error.hidden = true;
  showFile();
}

function showFile() {
  const el = document.querySelector('#file-selected');
  el.hidden = false;
  el.innerHTML = `${icon('document', 18)} <span>${esc(file.name)} <small>(${(file.size / 1024).toFixed(0)} KB)</small></span><button type="button" aria-label="Remove file">${icon('close', 17)}</button>`;
  el.querySelector('button').onclick = () => { file = null; document.querySelector('#file').value = ''; el.hidden = true; };
}

async function readFile(f) {
  const ext = f.name.split('.').pop().toLowerCase();
  if (ext === 'txt' || ext === 'md') return f.text();
  if (ext === 'docx') {
    const mammoth = await import('mammoth/mammoth.browser');
    return (await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() })).value;
  }
  if (ext === 'pdf') {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()), disableFontFace: true, isEvalSupported: false, useSystemFonts: true }).promise;
    const pages = [];
    try {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        let lastY = null;
        let output = '';
        for (const item of content.items) {
          if (!('str' in item)) continue;
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 3) output += '\n';
          else if (output && !output.endsWith('\n') && !output.endsWith(' ')) output += ' ';
          output += item.str;
          lastY = item.transform[5];
        }
        pages.push(output);
      }
    } finally { await pdf.destroy(); }
    return pages.join('\n');
  }
  throw new Error(t().typeError);
}

async function submit(e) {
  e.preventDefault();
  const error = document.querySelector('#error');
  error.hidden = true;
  if (!file) { error.textContent = t().required; error.hidden = false; document.querySelector('#file').focus(); return; }
  details = Object.fromEntries(new FormData(e.currentTarget));
  const button = document.querySelector('#analyze');
  button.disabled = true;
  button.textContent = t().processing;
  try {
    const text = await readFile(file);
    if (!text.trim()) throw new Error(t().emptyError);
    report = analyze(text, details.jd, lang);
    isSample = false;
    render();
    document.querySelector('#results').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    error.textContent = err.message?.includes('too short') || err.message?.includes('terlalu singkat') || err.message === t().emptyError ? err.message : t().readError;
    error.hidden = false;
    button.disabled = false;
    button.innerHTML = `${t().button} ${icon('arrow', 19)}`;
  }
}

function sample() {
  const text = `Alex Rivera\nalex@example.com | +1 555 123 4567\nProfessional Summary\nProduct designer with experience creating accessible digital products for growing teams.\nWork Experience\nProduct Designer, Studio North | 2021–2024\n- Designed onboarding flows for a mobile app, improving completion by 24%.\n- Collaborated with engineers and researchers to ship 12 projects.\nEducation\nBA Graphic Design, City University\nSkills\nFigma, prototyping, user research, collaboration, accessibility`;
  report = analyze(text, 'Product designer with Figma, research, prototyping and design systems experience', lang);
  isSample = true;
  render();
  document.querySelector('#results').scrollIntoView({ behavior: 'smooth' });
}

function save(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function downloadDocx() {
  if (!report || isSample) return;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
  const lines = report.text.split('\n').map(x => x.trim()).filter(Boolean);
  const children = lines.map((line, index) => new Paragraph({
    heading: index === 0 ? HeadingLevel.TITLE : /^(professional summary|summary|profile|work experience|experience|education|skills|ringkasan|profil|pengalaman kerja|pendidikan|keahlian)$/i.test(line) ? HeadingLevel.HEADING_2 : undefined,
    bullet: /^[•*-]\s/.test(line) ? { level: 0 } : undefined,
    children: [new TextRun(line.replace(/^[•*-]\s/, ''))],
    spacing: { after: index === 0 ? 200 : 90 }
  }));
  const doc = new Document({ sections: [{ properties: {}, children }] });
  save(await Packer.toBlob(doc), `cv-atlas-${(details.name || 'resume').trim().replace(/[^\w-]+/g, '-').slice(0, 40)}.docx`);
}

async function downloadPdf() {
  if (!report || isSample) return;
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const write = (text, y, size = 10, color = [35, 50, 56]) => {
    doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, 170);
    for (const line of lines) { if (y > 275) { doc.addPage(); y = 22; } doc.text(line, 20, y); y += size * 0.55; }
    return y + 5;
  };
  let y = write('CV ATLAS  /  RESUME REVIEW', 24, 16);
  y = write(`${details.name || 'Resume'}${details.role ? '  |  ' + details.role : ''}${details.country ? '  |  ' + details.country : ''}`, y, 10);
  y = write(`${t().score}: ${report.score}/100`, y + 6, 15);
  y = write(t().disclaimer, y, 9, [90, 104, 112]);
  for (const item of report.results) {
    y = write(`${labels[lang][item.key]}  -  ${item.score}%`, y + 3, 12);
    y = write(item.detail, y);
    if (item.score < 100) y = write(item.tip, y, 9);
  }
  if (report.missing.length) y = write(`${t().missing}: ${report.missing.join(', ')}`, y + 5);
  write(t().revised, y + 10, 9);
  doc.save('cv-atlas-review.pdf');
}

render();
