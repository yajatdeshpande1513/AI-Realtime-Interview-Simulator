const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

function getApiKey() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const match = content.match(/GROQ_API_KEY\s*=\s*(.*)/);
  return match ? match[1].trim() : null;
}

async function test() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("GROQ_API_KEY not found");
    return;
  }
  const groq = new Groq({ apiKey });
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log("SUCCESS: " + chatCompletion.choices[0].message.content);
  } catch (err) {
    console.log("FAILED: " + err.message);
  }
}
test();
