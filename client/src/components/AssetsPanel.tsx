import type { Asset } from '../types';

type Props = {
  assets: Asset[];
  onSell: (assetId: string) => Promise<void> | void;
  disabled?: boolean;
  pendingId?: string | null;
};

export function AssetsPanel({ assets, onSell, disabled = false, pendingId }: Props) {
  const ownedAssets = assets.filter((asset) => asset.isOwned);

  return (
    <section className="card">
      <header className="card-header">
        <div>
          <h3>Assets</h3>
          <p>Pawn something when the chips dry up.</p>
        </div>
      </header>
      {assets.length === 0 && <p>No assets on record.</p>}
      <ul className="asset-list">
        {assets.map((asset) => (
          <li key={asset.id} className={asset.isOwned ? '' : 'sold'}>
            <div>
              <strong>{asset.name}</strong>
              <span className="label">{asset.type}</span>
            </div>
            <div className="asset-actions">
              <span>${asset.value.toLocaleString()}</span>
              <button
                disabled={!asset.isOwned || disabled || pendingId === asset.id}
                onClick={() => onSell(asset.id)}
              >
                {asset.isOwned ? (pendingId === asset.id ? 'Selling...' : 'Sell') : 'Sold'}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {ownedAssets.length === 0 && (
        <p className="warning">Everything has been sold. Nothing left to leverage.</p>
      )}
    </section>
  );
}
