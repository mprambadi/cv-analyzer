import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, extractKeywords } from './analyze.js';

const cv = `Alex Rivera\nalex@example.com | +1 555 123 4567\nProfessional Summary\nProduct designer focused on clear interfaces and accessible experiences.\nWork Experience\n- Led design reviews for 12 projects with a distributed team.\n- Improved onboarding completion by 32% across 3 products.\nEducation\nBA Design, State University\nSkills\nFigma, research, prototyping, accessibility and collaboration. This background includes several years of product experience delivering useful interfaces for people.`;
test('detects sections and aligns role keywords without fabricating claims', () => {
  const report = analyze(cv, 'Figma Figma accessibility Kubernetes', 'en');
  assert.equal(report.results.find(r => r.key === 'contact').score, 100);
  assert.equal(report.results.find(r => r.key === 'experience').score, 100);
  assert.ok(report.matched.includes('figma'));
  assert.ok(report.missing.includes('kubernetes'));
  assert.deepEqual(extractKeywords('Figma Figma Kubernetes').slice(0, 2), ['figma', 'kubernetes']);
  assert.throws(() => analyze('tiny'));
});
test('does not mistake employment date range for a phone number', () => {
  const withoutPhone = cv.replace('+1 555 123 4567', '2017 - 2026');
  assert.equal(analyze(withoutPhone).results.find(r => r.key === 'contact').score, 50);
});
