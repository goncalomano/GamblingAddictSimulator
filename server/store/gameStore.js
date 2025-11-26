const players = new Map();

function savePlayer(player) {
  players.set(player.id, player);
  return player;
}

function getPlayer(id) {
  return players.get(id);
}

function updatePlayer(player) {
  if (!players.has(player.id)) {
    throw new Error('Player missing from store');
  }
  players.set(player.id, player);
  return player;
}

module.exports = {
  savePlayer,
  getPlayer,
  updatePlayer,
};
