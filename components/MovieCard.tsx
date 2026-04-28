import { Movie, posterUrl } from "@/lib/tmdb";
import { Star } from "lucide-react";

interface Props {
  movie: Movie;
  onClick: (m: Movie) => void;
}

export const MovieCard = ({ movie, onClick }: Props) => {
  const img = posterUrl(movie.poster_path, "w500");
  return (
    <button
      onClick={() => onClick(movie)}
      className="group relative shrink-0 w-36 sm:w-44 md:w-48 overflow-hidden rounded-md bg-card text-left transition-smooth hover:scale-105 hover:z-10 hover:shadow-glow"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
        {img ? (
          <img
            src={img}
            alt={`${movie.title} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:brightness-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-background via-background/95 to-transparent p-3 transition-smooth group-hover:translate-y-0">
        <h3 className="line-clamp-1 text-sm font-semibold">{movie.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span>{movie.vote_average?.toFixed(1) ?? "N/A"}</span>
          {movie.release_date && <span>· {movie.release_date.slice(0, 4)}</span>}
        </div>
      </div>
    </button>
  );
};
