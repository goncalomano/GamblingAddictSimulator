function formatCurrency(amount) {
  return `$${amount.toLocaleString('en-US')}`;
}

function summarizeAssets(assets) {
  const owned = assets.filter((asset) => asset.isOwned);
  if (!owned.length) {
    return 'nothing left to pawn off';
  }
  const names = owned.map((asset) => asset.name.toLowerCase());
  if (names.length === 1) {
    return names[0];
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  const last = names.pop();
  return `${names.join(', ')}, and ${last}`;
}

function generateLifeStory(player) {
  const ownedAssets = player.assets.filter((asset) => asset.isOwned);
  const ownedValue = ownedAssets.reduce((sum, asset) => sum + asset.value, 0);
  const netWorth = player.cash + ownedValue;
  const delta = netWorth - player.initialNetWorth;
  const progress = delta / player.initialNetWorth;
  const rounds = player.roundsPlayed;

  let title;
  let text;

  if (ownedAssets.length === 0 && player.cash <= 0) {
    title = `${player.name} hits absolute bottom`;
    text = `${player.name} has sold every last possession and stares at pockets lined with lint. The blackjack tables feel colder now, and the friends who once cheered are gone. With nothing left to bargain, ${player.name} wonders how to explain the collapse to family.`;
  } else if (progress <= -0.5) {
    title = `${player.name} keeps doubling down on trouble`;
    text = `${player.name} blew past every sensible limit. ${formatCurrency(Math.abs(delta))} has evaporated, and now ${player.name} eyes ${summarizeAssets(player.assets)} just to fund another bet. The pit boss is starting to recognize the nervous swagger.`;
  } else if (progress >= 0.5) {
    title = `${player.name} rides a winning streak`;
    text = `Against the odds, ${player.name} is up around ${formatCurrency(Math.round(delta))}. Bills are getting paid, and even the ${summarizeAssets(player.assets)} look shinier. The table regulars whisper that ${player.name} might actually beat the system.`;
  } else {
    title = `${player.name} treads water`;
    text = `${player.name} keeps grinding through double shifts and late-night blackjack. There's ${formatCurrency(player.cash)} on hand and ${summarizeAssets(player.assets)} to lean on, but the dream of escaping the grind always feels one hot hand away.`;
  }

  return {
    roundNumber: rounds,
    title,
    text,
  };
}

module.exports = { generateLifeStory };
