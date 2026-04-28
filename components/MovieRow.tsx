import { Movie } from "@/lib/tmdb";
import { MovieCard } from "./MovieCard";

interface Props {
  title: string;
  movies: Movie[];
  onSelect: (m: Movie) => void;
}

export const MovieRow = ({ title, movies, onSelect }: Props) => {
  if (!movies.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} onClick={onSelect} />
        ))}
      </div>
    </section>
  );
};
