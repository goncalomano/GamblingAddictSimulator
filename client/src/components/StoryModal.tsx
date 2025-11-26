import type { StoryEntry } from '../types';

type Props = {
  story: StoryEntry;
  onClose: () => void;
};

export function StoryModal({ story, onClose }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal card">
        <div className="modal-header">
          <h3>{story.title}</h3>
          <button onClick={onClose} aria-label="Close story">
            &times;
          </button>
        </div>
        <p>{story.text}</p>
        {story.videoUrl && (
          <video controls src={story.videoUrl} width={320} />
        )}
        <button className="full" onClick={onClose}>
          Back to the table
        </button>
      </div>
    </div>
  );
}
