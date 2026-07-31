// Calls the Anthropic Messages API directly from the browser using the
// teacher's own API key (entered on the options page). There's no backend,
// so this relies on Anthropic's direct-browser-access opt-in header.

function buildSubPlanPrompt({ gradeLevel, subject, classDuration, notes }) {
  return `You are helping a K-12 classroom teacher write a plan for a substitute teacher.

Grade level: ${gradeLevel}
Subject / class: ${subject}
Class length: ${classDuration}
Notes from the regular teacher: ${notes || 'None provided.'}

Write a clear, ready-to-hand-to-a-substitute lesson plan. Include a short
welcome note to the substitute, a minute-by-minute schedule, step-by-step
activity instructions a non-specialist could follow, and a backup activity
in case there's extra time. Use plain language and headings.`;
}

async function generateSubPlan(apiKey, formData) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: buildSubPlanPrompt(formData) }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Anthropic API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}
