const { randomUUID } = require('node:crypto');
const { generateFaceImage } = require('../services/faceGenerator');

const INITIAL_CASH = 1000;

const ASSET_POOL = [
  { type: 'house', name: 'Starter Ranch Home', value: 185000 },
  { type: 'car', name: 'Used Sedan', value: 12000 },
  { type: 'car', name: 'Pickup Truck', value: 22000 },
  { type: 'watch', name: 'Pawn Shop Rolex', value: 6000 },
  { type: 'savings', name: '401k Fragment', value: 8000 },
  { type: 'boat', name: 'Old Bass Boat', value: 7000 },
  { type: 'jewelry', name: 'Wedding Ring', value: 3000 },
  { type: 'collectible', name: 'Baseball Card Set', value: 2500 },
];

function pickInitialAssets() {
  const shuffled = [...ASSET_POOL].sort(() => Math.random() - 0.5);
  const count = 3 + Math.floor(Math.random() * 2);
  return shuffled.slice(0, count).map((asset) => ({
    ...asset,
    id: randomUUID(),
    isOwned: true,
  }));
}

async function createPlayerCharacter(name) {
  const assets = pickInitialAssets();
  const faceImageUrl = await Promise.resolve(generateFaceImage(name));
  const initialAssetValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return {
    id: randomUUID(),
    name: name || 'Average Worker',
    faceImageUrl,
    cash: INITIAL_CASH,
    initialNetWorth: INITIAL_CASH + initialAssetValue,
    assets,
    roundsPlayed: 0,
    stories: [],
    currentHand: null,
    createdAt: new Date().toISOString(),
  };
}

function sellAsset(player, assetId) {
  const asset = player.assets.find((item) => item.id === assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }
  if (!asset.isOwned) {
    throw new Error('Asset already sold');
  }
  asset.isOwned = false;
  player.cash += asset.value;
  return asset;
}

function getOwnedAssetValue(player) {
  return player.assets
    .filter((asset) => asset.isOwned)
    .reduce((sum, asset) => sum + asset.value, 0);
}

module.exports = {
  INITIAL_CASH,
  createPlayerCharacter,
  sellAsset,
  getOwnedAssetValue,
};
