import { useEffect, useState } from 'react';
import './App.css';
import { CharacterForm } from './components/CharacterForm';
import { CharacterOverview } from './components/CharacterOverview';
import { BlackjackTable } from './components/BlackjackTable';
import { AssetsPanel } from './components/AssetsPanel';
import { StoryPanel } from './components/StoryPanel';
import { StoryModal } from './components/StoryModal';
import { createCharacter, hit, sellAsset, stand, startRound } from './api';
import type { PlayerCharacter, StoryEntry } from './types';

function App() {
  const [player, setPlayer] = useState<PlayerCharacter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bet, setBet] = useState(50);
  const [pendingAsset, setPendingAsset] = useState<string | null>(null);
  const [storyModal, setStoryModal] = useState<StoryEntry | null>(null);

  useEffect(() => {
    if (!player) return;
    const lastStory = player.stories[player.stories.length - 1];
    if (lastStory && lastStory.roundNumber === player.roundsPlayed && player.roundsPlayed % 3 === 0) {
      setStoryModal(lastStory);
    }
    if (player.cash > 0 && bet <= 0) {
      setBet(Math.min(50, player.cash));
    }
    if (player.cash > 0 && bet > player.cash) {
      setBet(player.cash);
    }
  }, [player, bet]);

  const handleCreate = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createCharacter(name);
      setPlayer(created);
      setBet(50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  const handleBetChange = (value: number) => {
    if (!Number.isFinite(value)) {
      setBet(0);
      return;
    }
    setBet(Math.max(0, Math.floor(value)));
  };

  const handleStartRound = async () => {
    if (!player) return;
    setLoading(true);
    setError(null);
    try {
      const response = await startRound(player.id, bet);
      setPlayer(response.player);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start round');
    } finally {
      setLoading(false);
    }
  };

  const handleHit = async () => {
    if (!player) return;
    setLoading(true);
    setError(null);
    try {
      const response = await hit(player.id);
      setPlayer(response.player);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to hit');
    } finally {
      setLoading(false);
    }
  };

  const handleStand = async () => {
    if (!player) return;
    setLoading(true);
    setError(null);
    try {
      const response = await stand(player.id);
      setPlayer(response.player);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to stand');
    } finally {
      setLoading(false);
    }
  };

  const handleSellAsset = async (assetId: string) => {
    if (!player) return;
    setPendingAsset(assetId);
    setError(null);
    try {
      const response = await sellAsset(player.id, assetId);
      setPlayer(response.player);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sell asset');
    } finally {
      setPendingAsset(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gambling Addict Simulator</h1>
        <p>Manage a stressed worker, keep the lights on, and survive blackjack.</p>
      </header>

      {!player && <CharacterForm onCreate={handleCreate} loading={loading} />}

      {player && (
        <>
          <CharacterOverview player={player} />
          <div className="layout">
            <BlackjackTable
              player={player}
              bet={bet}
              onBetChange={handleBetChange}
              onStartRound={handleStartRound}
              onHit={handleHit}
              onStand={handleStand}
              loading={loading}
              error={error}
            />
            <div className="sidebar">
              <AssetsPanel assets={player.assets} onSell={handleSellAsset} disabled={loading} pendingId={pendingAsset} />
              <StoryPanel stories={player.stories} />
            </div>
          </div>
        </>
      )}

      {storyModal && <StoryModal story={storyModal} onClose={() => setStoryModal(null)} />}
    </div>
  );
}

export default App;
