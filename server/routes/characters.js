const express = require('express');
const {
  createPlayerCharacter,
  sellAsset,
  getOwnedAssetValue,
} = require('../models/playerCharacter');
const { savePlayer, getPlayer, updatePlayer } = require('../store/gameStore');
const {
  startHand,
  playerHit,
  playerStand,
  getHandPreview,
  buildCharacterSnapshot,
} = require('../game/blackjack');
const { generateLifeStory } = require('../services/storyGenerator');
const { generateCharacterVideo } = require('../services/nanobanana');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim() || 'Average Worker';
    const player = await createPlayerCharacter(name);
    savePlayer(player);
    res.json(serializePlayer(player));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', (req, res) => {
  const player = getPlayer(req.params.id);
  if (!player) {
    return res.status(404).json({ message: 'Character not found' });
  }
  return res.json(serializePlayer(player));
});

router.post('/:id/blackjack/start', async (req, res) => {
  try {
    const player = requirePlayer(req.params.id);
    const bet = req.body?.bet;
    const hand = startHand(player, bet);
    await maybeCreateStory(player);
    updatePlayer(player);
    res.json({ hand, player: serializePlayer(player) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/blackjack/hit', async (req, res) => {
  try {
    const player = requirePlayer(req.params.id);
    const hand = playerHit(player);
    await maybeCreateStory(player);
    updatePlayer(player);
    res.json({ hand, player: serializePlayer(player) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/blackjack/stand', async (req, res) => {
  try {
    const player = requirePlayer(req.params.id);
    const hand = playerStand(player);
    await maybeCreateStory(player);
    updatePlayer(player);
    res.json({ hand, player: serializePlayer(player) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/assets/sell', (req, res) => {
  try {
    const player = requirePlayer(req.params.id);
    const assetId = req.body?.assetId;
    if (!assetId) {
      return res.status(400).json({ message: 'assetId is required' });
    }
    const soldAsset = sellAsset(player, assetId);
    updatePlayer(player);
    res.json({ asset: soldAsset, player: serializePlayer(player) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

function requirePlayer(id) {
  const player = getPlayer(id);
  if (!player) {
    throw new Error('Character not found');
  }
  return player;
}

function serializePlayer(player) {
  const ownedAssetValue = getOwnedAssetValue(player);
  const currentHand = getHandPreview(player.currentHand);
  const isBroke = player.cash <= 0 && ownedAssetValue === 0;
  return {
    id: player.id,
    name: player.name,
    faceImageUrl: player.faceImageUrl,
    cash: player.cash,
    assets: player.assets,
    roundsPlayed: player.roundsPlayed,
    stories: player.stories,
    currentHand,
    netWorth: player.cash + ownedAssetValue,
    initialNetWorth: player.initialNetWorth,
    isBroke,
  };
}

async function maybeCreateStory(player) {
  if (!player.currentHand || player.currentHand.status !== 'completed') {
    return;
  }
  if (player.roundsPlayed === 0 || player.roundsPlayed % 3 !== 0) {
    return;
  }
  const existingStory = player.stories.find(
    (story) => story.roundNumber === player.roundsPlayed,
  );
  if (existingStory) {
    return;
  }

  const story = generateLifeStory(player);
  const snapshot = buildCharacterSnapshot(player);
  const videoUrl = await generateCharacterVideo(snapshot, story);
  player.stories.push({
    roundNumber: story.roundNumber,
    title: story.title,
    text: story.text,
    videoUrl,
    createdAt: new Date().toISOString(),
  });
}

module.exports = router;
