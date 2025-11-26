const { getOwnedAssetValue } = require('../models/playerCharacter');

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = [
  { label: 'A', value: 11 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: 'J', value: 10 },
  { label: 'Q', value: 10 },
  { label: 'K', value: 10 },
];

const PAYOUT_MULTIPLIER = {
  dealer_win: 0,
  player_bust: 0,
  player_win: 2,
  dealer_bust: 2,
  push: 1,
  player_blackjack: 2.5,
  dealer_blackjack: 0,
};

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank: rank.label, value: rank.value });
    }
  }
  return shuffle(deck);
}

function shuffle(deck) {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dealCard(deck) {
  if (!deck.length) {
    throw new Error('Deck is empty');
  }
  return deck.pop();
}

function calculateHandValue(hand) {
  let value = 0;
  let aceCount = 0;

  hand.forEach((card) => {
    value += card.value;
    if (card.rank === 'A') {
      aceCount += 1;
    }
  });

  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount -= 1;
  }

  return value;
}

function formatCard(card) {
  return { rank: card.rank, suit: card.suit };
}

function getHandPreview(handState) {
  if (!handState) {
    return null;
  }

  const playerValue = calculateHandValue(handState.playerHand);
  const dealerValue = calculateHandValue(handState.dealerHand);
  const isInProgress = handState.status === 'in_progress';

  return {
    status: handState.status,
    bet: handState.bet,
    playerCards: handState.playerHand.map(formatCard),
    dealerCards: isInProgress
      ? [formatCard(handState.dealerHand[0]), { rank: '?', suit: 'Hidden' }]
      : handState.dealerHand.map(formatCard),
    playerValue,
    dealerValue: isInProgress ? null : dealerValue,
    outcome: handState.outcome,
  };
}

function ensureNoActiveHand(player) {
  if (player.currentHand && player.currentHand.status === 'in_progress') {
    throw new Error('A round is already in progress');
  }
}

function ensureActiveHand(player) {
  if (!player.currentHand || player.currentHand.status !== 'in_progress') {
    throw new Error('No active round');
  }
}

function startHand(player, betInput) {
  ensureNoActiveHand(player);

  const bet = Math.max(1, Math.floor(Number(betInput)));
  if (!Number.isFinite(bet) || bet <= 0) {
    throw new Error('Bet must be a positive number');
  }
  if (bet > player.cash) {
    throw new Error('Insufficient cash for bet');
  }

  player.cash -= bet;

  const deck = createDeck();
  const playerHand = [dealCard(deck), dealCard(deck)];
  const dealerHand = [dealCard(deck), dealCard(deck)];

  player.currentHand = {
    deck,
    playerHand,
    dealerHand,
    bet,
    status: 'in_progress',
    outcome: null,
  };

  checkForImmediateResult(player);
  return getHandPreview(player.currentHand);
}

function playerHit(player) {
  ensureActiveHand(player);
  const { currentHand } = player;
  currentHand.playerHand.push(dealCard(currentHand.deck));
  const value = calculateHandValue(currentHand.playerHand);
  if (value > 21) {
    finalizeHand(player, 'player_bust', 'Busted over 21.');
  }
  return getHandPreview(player.currentHand);
}

function playerStand(player) {
  ensureActiveHand(player);
  const { currentHand } = player;
  let dealerValue = calculateHandValue(currentHand.dealerHand);
  while (dealerValue < 17) {
    currentHand.dealerHand.push(dealCard(currentHand.deck));
    dealerValue = calculateHandValue(currentHand.dealerHand);
  }

  const playerValue = calculateHandValue(currentHand.playerHand);

  if (dealerValue > 21) {
    finalizeHand(player, 'dealer_bust', 'Dealer busts. You win!');
  } else if (dealerValue > playerValue) {
    finalizeHand(player, 'dealer_win', 'Dealer wins this round.');
  } else if (dealerValue < playerValue) {
    finalizeHand(player, 'player_win', 'You beat the dealer!');
  } else {
    finalizeHand(player, 'push', 'Push. Your chips are returned.');
  }

  return getHandPreview(player.currentHand);
}

function checkForImmediateResult(player) {
  const { currentHand } = player;
  const playerValue = calculateHandValue(currentHand.playerHand);
  const dealerValue = calculateHandValue(currentHand.dealerHand);

  if (playerValue === 21 && dealerValue === 21) {
    finalizeHand(player, 'push', 'Both hit blackjack. Push.');
  } else if (playerValue === 21) {
    finalizeHand(player, 'player_blackjack', 'Blackjack! Big payout.');
  } else if (dealerValue === 21) {
    finalizeHand(player, 'dealer_blackjack', 'Dealer hits blackjack. Tough luck.');
  }
}

function finalizeHand(player, result, message) {
  const { currentHand } = player;
  if (!currentHand || currentHand.status === 'completed') {
    return;
  }

  const bet = currentHand.bet;
  const playerValue = calculateHandValue(currentHand.playerHand);
  const dealerValue = calculateHandValue(currentHand.dealerHand);
  const payoutMultiplier = PAYOUT_MULTIPLIER[result] ?? 0;
  const payout = bet * payoutMultiplier;
  if (payout > 0) {
    player.cash += payout;
  }

  const cashDelta = payout - bet;

  currentHand.status = 'completed';
  currentHand.outcome = {
    result,
    message,
    bet,
    cashDelta,
    playerValue,
    dealerValue,
  };

  player.roundsPlayed += 1;
}

function buildCharacterSnapshot(player) {
  const ownedAssetValue = getOwnedAssetValue(player);
  return {
    id: player.id,
    name: player.name,
    cash: player.cash,
    assets: player.assets,
    roundsPlayed: player.roundsPlayed,
    netWorth: player.cash + ownedAssetValue,
  };
}

module.exports = {
  startHand,
  playerHit,
  playerStand,
  getHandPreview,
  buildCharacterSnapshot,
};
