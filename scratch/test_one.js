const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

function getApiKey() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const match = content.match(/GEMINI_API_KEY\s*=\s*(.*)/);
  return match ? match[1].trim() : null;
}

async function test() {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  try {
    const result = await model.generateContent("Hello");
    console.log("SUCCESS: " + result.response.text());
  } catch (err) {
    console.log("FAILED: " + err.message);
  }
}
test();
