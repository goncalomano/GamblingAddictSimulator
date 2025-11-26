import { useState } from 'react';
import type { FormEvent } from 'react';

type Props = {
  onCreate: (name: string) => Promise<void> | void;
  loading: boolean;
};

export function CharacterForm({ onCreate, loading }: Props) {
  const [name, setName] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Name your unlucky hero</h2>
      <p>Give the average worker a name before sending them to the casino floor.</p>
      <div className="form-row">
        <input
          type="text"
          placeholder="e.g., John, Maria, Uncle Ron"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Creating...' : 'Create Character'}
        </button>
      </div>
    </form>
  );
}
