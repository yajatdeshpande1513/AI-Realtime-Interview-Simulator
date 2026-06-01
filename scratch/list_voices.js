const fs = require('fs');
const path = require('path');

function getApiKey() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const match = content.match(/ELEVENLABS_API_KEY\s*=\s*(.*)/);
  return match ? match[1].trim() : null;
}

async function listVoices() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY not found");
    return;
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    });
    const data = await response.json();
    if (data.voices) {
      console.log("Available Voices:");
      data.voices.forEach(v => console.log(`- ${v.name}: ${v.voice_id}`));
    } else {
      console.log("No voices found or error:", data);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listVoices();
