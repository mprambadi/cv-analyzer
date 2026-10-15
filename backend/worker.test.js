import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

const resumeText = `Alex Rivera\nalex@example.com | +1 555 123 4567\nProfessional Summary\nProduct designer creating accessible interfaces and useful onboarding experiences.\nExperience\n- Delivered twelve design projects with engineers and research teams over several years.\n- Improved onboarding completion by 32% while working with designers and stakeholders.\nEducation\nBA Design, State University\nSkills\nFigma, user research, accessibility and prototyping.`;
const env = { AGENT_TOKEN: 'test-secret', NINEROUTER_BASE_URL: 'https://example.com/v1', NINEROUTER_API_KEY: 'provider-secret', NINEROUTER_MODEL: 'model' };
const req = (body, token = 'test-secret') => new Request('https://worker.example/v1/analyze', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('rejects unauthenticated and oversized requests before provider calls', async () => {
  assert.equal((await worker.fetch(req({ resumeText }, 'wrong'), env)).status, 401);
  assert.equal((await worker.fetch(req({ resumeText: resumeText.repeat(150) }), env)).status, 413);
  assert.equal((await worker.fetch(req({ resumeText: resumeText.repeat(100) }), env)).status, 400);
  assert.equal((await worker.fetch(req({ resumeText }), { AGENT_TOKEN: 'test-secret' })).status, 503);
});

test('returns validated AI review and heuristic scores', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://example.com/v1/chat/completions');
    assert.equal(options.headers.authorization, 'Bearer provider-secret');
    return Response.json({ choices: [{ message: { content: JSON.stringify({ summary: 'Clear experience.', strengths: ['Measurable results'], prioritizedFixes: ['Tailor skills'], suggestedEdits: ['Clarify onboarding scope'] }) } }] });
  };
  try {
    const response = await worker.fetch(req({ resumeText, jobDescription: 'Figma accessibility Kubernetes' }), env);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.heuristics.results.find(x => x.key === 'contact').score, 100);
    assert.ok(body.heuristics.missing.includes('kubernetes'));
    assert.equal(body.ai.prioritizedFixes[0], 'Tailor skills');
  } finally { globalThis.fetch = original; }
});

test('rejects malformed model output without leaking provider details', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ choices: [{ message: { content: '{"summary":"missing arrays"}' } }] });
  try {
    const response = await worker.fetch(req({ resumeText }), env);
    assert.equal(response.status, 502);
    assert.equal((await response.json()).error.code, 'invalid_provider_response');
  } finally { globalThis.fetch = original; }
});
