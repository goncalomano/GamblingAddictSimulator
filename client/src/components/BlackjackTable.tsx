import type { PlayerCharacter } from '../types';

type Props = {
  player: PlayerCharacter;
  bet: number;
  onBetChange: (value: number) => void;
  onStartRound: () => Promise<void> | void;
  onHit: () => Promise<void> | void;
  onStand: () => Promise<void> | void;
  loading: boolean;
  error?: string | null;
};

export function BlackjackTable({
  player,
  bet,
  onBetChange,
  onStartRound,
  onHit,
  onStand,
  loading,
  error,
}: Props) {
  const hand = player.currentHand;
  const inProgress = hand?.status === 'in_progress';
  const canStart = !inProgress && player.cash > 0;

  return (
    <section className="card table">
      <header className="card-header">
        <div>
          <h3>Blackjack Table</h3>
          <p>Bet smarter than your impulses.</p>
        </div>
        <span className="label">Cash: ${player.cash.toLocaleString()}</span>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="bet-row">
        <label htmlFor="bet">Bet amount</label>
        <input
          id="bet"
          type="number"
          min={1}
          max={player.cash}
          value={bet}
          disabled={!canStart || loading}
          onChange={(event) => onBetChange(Number(event.target.value))}
        />
        <button disabled={!canStart || loading || bet <= 0 || bet > player.cash} onClick={onStartRound}>
          {inProgress ? 'Round active' : 'Deal cards'}
        </button>
      </div>

      {player.cash <= 0 && (
        <p className="warning">No cash left. Sell an asset to keep playing.</p>
      )}

      {hand ? (
        <div className="hand-grid">
          <HandColumn title="You" value={hand.playerValue} cards={hand.playerCards} highlight />
          <HandColumn title="Dealer" value={hand.dealerValue ?? undefined} cards={hand.dealerCards} />
        </div>
      ) : (
        <p>No active round. Place a bet to start.</p>
      )}

      {inProgress && (
        <div className="action-row">
          <button disabled={loading} onClick={onHit}>
            Hit
          </button>
          <button disabled={loading} onClick={onStand}>
            Stand
          </button>
        </div>
      )}

      {hand?.outcome && hand.status === 'completed' && (
        <div className="outcome">
          <strong>{hand.outcome.message}</strong>
          <span>
            Cash impact: {hand.outcome.cashDelta >= 0 ? '+' : '-'}$
            {Math.abs(hand.outcome.cashDelta).toLocaleString()}
          </span>
        </div>
      )}
    </section>
  );
}

type HandColumnProps = {
  title: string;
  value?: number;
  cards: { rank: string; suit: string }[];
  highlight?: boolean;
};

function HandColumn({ title, value, cards, highlight }: HandColumnProps) {
  return (
    <div className={`hand-column ${highlight ? 'highlight' : ''}`}>
      <div className="hand-header">
        <h4>{title}</h4>
        {value !== undefined && <span className="label">Value: {value}</span>}
      </div>
      <div className="card-row">
        {cards.map((card, index) => (
          <div key={`${card.rank}-${card.suit}-${index}`} className="playing-card">
            <span>{card.rank}</span>
            <span>{card.suit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
