export const labels = {
  en: {
    contact: 'Contact details', summary: 'Professional summary', experience: 'Work experience', education: 'Education', skills: 'Skills', formatting: 'Readability', keywords: 'Role alignment'
  },
  id: {
    contact: 'Informasi kontak', summary: 'Ringkasan profesional', experience: 'Pengalaman kerja', education: 'Pendidikan', skills: 'Keahlian', formatting: 'Keterbacaan', keywords: 'Kesesuaian posisi'
  }
};

const terms = {
  summary: /(?:^|\n)\s*(?:professional\s+)?(?:summary|profile|objective|about me|ringkasan|profil|tentang saya)\b/im,
  experience: /(?:^|\n)\s*(?:work|professional|employment|relevant)?\s*(?:experience|history|pengalaman(?: kerja)?)\b/im,
  education: /(?:^|\n)\s*(?:education|academic|pendidikan|riwayat pendidikan)\b/im,
  skills: /(?:^|\n)\s*(?:technical|core|key)?\s*(?:skills|competencies|keahlian|keterampilan)\b/im
};

const stop = new Set('about after again also and are been can did for from has have into job its more our out per role that the their them there these this through was were what when where which while will with you your atau agar akan dalam dari dengan pada untuk yang dan ini itu serta sebagai lebih kerja kami anda adalah telah dapat posisi pengalaman tahun kemampuan skills work experience required preferred must strong ability including using such other'.split(' '));

export function extractKeywords(text) {
  const words = (text.toLowerCase().match(/[\p{L}][\p{L}\d+#.-]{2,}/gu) || []).filter(w => !stop.has(w));
  const counts = new Map();
  words.forEach(w => counts.set(w, (counts.get(w) || 0) + 1));
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([word]) => word);
}

function hasPhone(text) {
  return (text.match(/(?:\+?\d[\d\s().-]{6,}\d)/g) || []).some(candidate => {
    const digits = candidate.replace(/\D/g, '');
    return digits.length >= 9 && digits.length <= 15 && !/^\d{4}\s*[-–]\s*\d{4}$/.test(candidate.trim());
  });
}

export function analyze(text, job = '', lang = 'en') {
  const clean = text.replace(/\r\n?/g, '\n').trim();
  if (clean.length < 80) throw new Error(lang === 'id' ? 'Teks CV terlalu singkat atau tidak terbaca. Coba file berbasis teks.' : 'Resume text is too short or unreadable. Try a text-based file.');
  const lines = clean.split('\n').map(s => s.trim()).filter(Boolean);
  const words = clean.split(/\s+/).length;
  const email = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(clean);
  const phone = hasPhone(clean);
  const results = [];
  const add = (key, score, detailEn, detailId, tipEn, tipId) => results.push({ key, score, detail: lang === 'id' ? detailId : detailEn, tip: lang === 'id' ? tipId : tipEn });
  add('contact', (email ? 50 : 0) + (phone ? 50 : 0), email && phone ? 'Email and phone number found.' : 'Some contact details are missing.', email && phone ? 'Email dan nomor telepon ditemukan.' : 'Sebagian informasi kontak belum ada.', 'Add a plain-text email address and phone number near your name.', 'Tambahkan email dan nomor telepon dalam teks biasa di dekat nama.');
  const sections = ['summary', 'experience', 'education', 'skills'];
  const tips = {
    summary: ['Add a short professional summary tailored to the role.', 'Tambahkan ringkasan singkat sesuai posisi tujuan.'],
    experience: ['Use a clear Work Experience heading and describe your responsibilities and results.', 'Gunakan judul Pengalaman Kerja dan jelaskan tanggung jawab serta hasil.'],
    education: ['Add an Education heading with your qualification and institution.', 'Tambahkan bagian Pendidikan berisi kualifikasi dan institusi.'],
    skills: ['Add a Skills heading with relevant, specific tools and capabilities.', 'Tambahkan bagian Keahlian berisi alat dan kemampuan yang relevan.']
  };
  for (const key of sections) {
    const found = terms[key].test(clean);
    const score = found ? 100 : 0;
    add(key, score, found ? 'Section heading found.' : 'No recognizable section heading found.', found ? 'Judul bagian ditemukan.' : 'Judul bagian belum terdeteksi.', ...tips[key]);
  }
  const bullets = lines.filter(l => /^[•\-*]\s|^\d+[.)]\s/.test(l)).length;
  const metrics = /\b\d+(?:[.,]\d+)?\s*(?:%|percent|juta|million|k|m|users|customers|clients|orang|tim|projects|proyek)\b/i.test(clean);
  const formatting = Math.min(100, (words >= 120 ? 30 : words >= 70 ? 15 : 0) + (words <= 1200 ? 25 : 0) + (bullets >= 2 ? 25 : 0) + (metrics ? 20 : 0));
  add('formatting', formatting, `${words} words · ${bullets} bullets${metrics ? ' · measurable results' : ''}.`, `${words} kata · ${bullets} poin${metrics ? ' · hasil terukur' : ''}.`, 'Use concise bullets and quantify outcomes where possible; keep the document easy to scan.', 'Gunakan poin singkat dan hasil terukur agar CV mudah dipindai.');
  const keywords = job.trim() ? extractKeywords(job) : [];
  const matched = keywords.filter(w => new RegExp(`(^|[^\\p{L}\\d])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\d])`, 'iu').test(clean));
  const missing = keywords.filter(w => !matched.includes(w));
  if (keywords.length) add('keywords', Math.round(matched.length / keywords.length * 100), `${matched.length} of ${keywords.length} job-description terms found.`, `${matched.length} dari ${keywords.length} istilah lowongan ditemukan.`, 'Include relevant missing terms only if they honestly describe your experience.', 'Tambahkan istilah relevan yang belum ada hanya jika sesuai pengalaman Anda.');
  const score = Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length);
  return { score, results, keywords, matched, missing, words, text: clean, lang };
}
