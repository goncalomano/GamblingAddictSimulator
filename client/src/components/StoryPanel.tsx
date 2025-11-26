import type { StoryEntry } from '../types';

type Props = {
  stories: StoryEntry[];
};

export function StoryPanel({ stories }: Props) {
  if (stories.length === 0) {
    return (
      <section className="card">
        <h3>Life updates</h3>
        <p>Every three rounds we will chronicle the chaos.</p>
      </section>
    );
  }

  return (
    <section className="card stories">
      <h3>Life updates</h3>
      <ul>
        {stories
          .slice()
          .reverse()
          .map((story) => (
            <li key={story.roundNumber}>
              <div className="story-header">
                <strong>{story.title}</strong>
                <span className="label">Round {story.roundNumber}</span>
              </div>
              <p>{story.text}</p>
              {story.videoUrl && (
                <video controls src={story.videoUrl} width={240} />
              )}
            </li>
          ))}
      </ul>
    </section>
  );
}
