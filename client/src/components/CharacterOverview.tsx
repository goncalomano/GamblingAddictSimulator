import type { PlayerCharacter } from '../types';

type Props = {
  player: PlayerCharacter;
};

export function CharacterOverview({ player }: Props) {
  return (
    <section className="card hero">
      <div className="hero-media">
        <img src={player.faceImageUrl} alt={`${player.name} avatar`} />
      </div>
      <div className="hero-details">
        <div className="label">Average worker</div>
        <h1>{player.name}</h1>
        <div className="stats-grid">
          <div>
            <span className="label">Cash on hand</span>
            <p className="value">${player.cash.toLocaleString()}</p>
          </div>
          <div>
            <span className="label">Net worth</span>
            <p className="value">${player.netWorth.toLocaleString()}</p>
          </div>
          <div>
            <span className="label">Rounds played</span>
            <p className="value">{player.roundsPlayed}</p>
          </div>
        </div>
        {player.isBroke && (
          <p className="warning">Completely broke. Sell assets or call it quits.</p>
        )}
      </div>
    </section>
  );
}
