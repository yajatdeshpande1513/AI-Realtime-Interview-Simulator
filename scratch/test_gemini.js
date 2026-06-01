const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

function getApiKey() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GEMINI_API_KEY\s*=\s*(.*)/);
      return match ? match[1].trim() : null;
    }
  } catch (err) {
    console.error("Error reading .env.local:", err);
  }
  return null;
}

async function checkModels() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }

  console.log("Testing API Key:", apiKey.substring(0, 5) + "...");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-pro-latest'];
    
    for (const modelName of models) {
      process.stdout.write(`Testing model ${modelName}... `);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log("SUCCESS: " + response.text().substring(0, 20) + "...");
      } catch (err) {
        console.log(`FAILED (${err.message})`);
      }
    }
  } catch (err) {
    console.error("Global Error:", err);
  }
}

checkModels();
