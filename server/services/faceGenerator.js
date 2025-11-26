const BASE_URL = 'https://api.dicebear.com/8.x/adventurer/svg';

function generateFaceImage(name) {
  const seed = encodeURIComponent(name || 'Average Worker');
  return `${BASE_URL}?seed=${seed}`;
}

module.exports = { generateFaceImage };
