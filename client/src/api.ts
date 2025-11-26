import type { BlackjackHand, PlayerCharacter } from './types';

function normalizeBase(base: string) {
  return base.replace(/\/$/, '');
}

const envUrl = import.meta.env.VITE_API_URL
  || (import.meta.env.URL ? `${normalizeBase(import.meta.env.URL)}/api` : null);

const API_BASE = envUrl || '/api';

type HandPayload = { hand: BlackjackHand | null; player: PlayerCharacter };

type AssetPayload = { player: PlayerCharacter };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.message || 'Request failed';
    throw new Error(message);
  }

  return response.json();
}

export function createCharacter(name: string): Promise<PlayerCharacter> {
  return request<PlayerCharacter>('/characters', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function fetchCharacter(id: string): Promise<PlayerCharacter> {
  return request<PlayerCharacter>(`/characters/${id}`);
}

export function startRound(id: string, bet: number): Promise<HandPayload> {
  return request<HandPayload>(`/characters/${id}/blackjack/start`, {
    method: 'POST',
    body: JSON.stringify({ bet }),
  });
}

export function hit(id: string): Promise<HandPayload> {
  return request<HandPayload>(`/characters/${id}/blackjack/hit`, {
    method: 'POST',
  });
}

export function stand(id: string): Promise<HandPayload> {
  return request<HandPayload>(`/characters/${id}/blackjack/stand`, {
    method: 'POST',
  });
}

export function sellAsset(id: string, assetId: string): Promise<AssetPayload> {
  return request<AssetPayload>(`/characters/${id}/assets/sell`, {
    method: 'POST',
    body: JSON.stringify({ assetId }),
  });
}
