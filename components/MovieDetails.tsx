import { useEffect, useState } from "react";
import { Movie, fetchDetails, fetchRecommendations, fetchVideos, posterUrl } from "@/lib/tmdb";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Star, Loader2, Bookmark, BookmarkCheck, Play } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Props {
  movie: Movie | null;
  onClose: () => void;
  onSelect: (m: Movie) => void;
}

export const MovieDetails = ({ movie, onClose, onSelect }: Props) => {
  const [details, setDetails] = useState<Movie | null>(null);
  const [recs, setRecs] = useState<Movie[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const { has, add, remove } = useWatchlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!movie) {
      setPlaying(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setDetails(null);
    setRecs([]);
    setTrailerKey(null);
    setPlaying(false);
    Promise.all([
      fetchDetails(movie.id),
      fetchRecommendations(movie.id),
      fetchVideos(movie.id).catch(() => []),
    ])
      .then(([d, r, vids]) => {
        if (cancelled) return;
        setDetails(d);
        setRecs(r);
        const yt = vids.find(
          (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
        ) ?? vids.find((v) => v.site === "YouTube" && v.type === "Trailer")
          ?? vids.find((v) => v.site === "YouTube");
        setTrailerKey(yt?.key ?? null);
      })
      .catch((e) => console.error("details error", e))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [movie]);

  const m = details ?? movie;
  if (!movie) return null;

  const inList = has(movie.id);
  const toggle = () => {
    if (!user) {
      onClose();
      navigate("/auth");
      return;
    }
    if (inList) remove(movie.id);
    else if (m) add(m);
  };

  return (
    <Dialog open={!!movie} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {playing && trailerKey ? (
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : m?.backdrop_path ? (
            <div className="relative h-48 sm:h-64 w-full overflow-hidden">
              <img
                src={posterUrl(m.backdrop_path, "original") ?? ""}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
              {trailerKey && (
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Play trailer"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground transition-smooth group-hover:scale-110 shadow-glow">
                    <Play className="h-7 w-7 fill-current ml-1" />
                  </span>
                </button>
              )}
            </div>
          ) : null}
          <div className="p-6 -mt-12 relative">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold">{m?.title}</h2>
              <button
                onClick={toggle}
                className="shrink-0 flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium transition-smooth hover:border-primary"
              >
                {inList ? (
                  <><BookmarkCheck className="h-4 w-4 text-primary" /> Saved</>
                ) : (
                  <><Bookmark className="h-4 w-4" /> Watchlist</>
                )}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-foreground font-medium">
                  {m?.vote_average?.toFixed(1) ?? "N/A"}
                </span>
              </div>
              {m?.release_date && <span>{m.release_date.slice(0, 4)}</span>}
              {details?.runtime ? <span>{details.runtime} min</span> : null}
              {trailerKey && !playing && (
                <button
                  onClick={() => setPlaying(true)}
                  className="ml-auto flex items-center gap-1 text-primary hover:underline"
                >
                  <Play className="h-4 w-4 fill-current" /> Watch trailer
                </button>
              )}
            </div>
            {details?.genres && details.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {details.genres.map((g) => (
                  <span key={g.id} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{m?.overview}</p>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Top 5 Recommendations</h3>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Finding similar movies...
                </div>
              ) : recs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recommendations available.</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {recs.map((r) => (
                    <MovieCard key={r.id} movie={r} onClick={(mv) => onSelect(mv)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
