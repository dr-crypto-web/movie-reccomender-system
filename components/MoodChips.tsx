import { cn } from "@/lib/utils";

export interface Mood {
  key: string;
  label: string;
  emoji: string;
  genres: number[]; // TMDB genre IDs
}

export const MOODS: Mood[] = [
  { key: "happy", label: "Happy", emoji: "😊", genres: [35, 10751] },           // Comedy, Family
  { key: "emotional", label: "Emotional", emoji: "😢", genres: [18, 10749] },   // Drama, Romance
  { key: "scary", label: "Scary", emoji: "😱", genres: [27, 53] },              // Horror, Thriller
  { key: "chill", label: "Chill", emoji: "😴", genres: [16, 10751, 12] },       // Animation, Family, Adventure
  { key: "action", label: "Action", emoji: "🔥", genres: [28, 12, 53] },        // Action, Adventure, Thriller
];

interface Props {
  active: string | null;
  onSelect: (mood: Mood | null) => void;
}

export const MoodChips = ({ active, onSelect }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((m) => {
        const isActive = active === m.key;
        return (
          <button
            key={m.key}
            onClick={() => onSelect(isActive ? null : m)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-smooth",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-glow"
                : "border-border bg-secondary text-foreground hover:border-primary/60",
            )}
          >
            <span className="text-base">{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
