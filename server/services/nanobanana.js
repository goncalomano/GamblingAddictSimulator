const API_URL = process.env.NANOBANANA_API_URL || 'https://api.nanobanana.pro/v1/videos';

async function generateCharacterVideo(characterState, story) {
  const apiKey = process.env.NANOBANANA_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: story.text,
        character: {
          name: characterState.name,
          cash: characterState.cash,
          assets: characterState.assets,
        },
        duration: 10,
      }),
    });

    if (!response.ok) {
      console.error('NanoBanana API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.videoUrl || null;
  } catch (error) {
    console.error('Failed to call NanoBanana API', error);
    return null;
  }
}

module.exports = { generateCharacterVideo };
