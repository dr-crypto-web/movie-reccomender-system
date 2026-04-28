import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Film, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Movie, fetchDetails } from "@/lib/tmdb";
import { MovieDetails } from "@/components/MovieDetails";
import { posterUrl } from "@/lib/tmdb";

const WatchlistPage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { items, loading, remove } = useWatchlist();
  const [selected, setSelected] = useState<Movie | null>(null);

  useEffect(() => {
    document.title = "My Watchlist — CineFind";
  }, []);

  const openDetails = async (movieId: number) => {
    try {
      const m = await fetchDetails(movieId);
      setSelected(m);
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Please sign in to view your watchlist.</p>
        <Link to="/auth" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex items-center gap-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <Link to="/" className="flex items-center gap-2 ml-4">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-extrabold tracking-tight text-gradient">CineFind</span>
          </Link>
          <button
            onClick={signOut}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="container py-10">
        <h1 className="text-3xl font-extrabold mb-6">My Watchlist</h1>

        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Your watchlist is empty.</p>
            <Link to="/" className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Browse movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-md bg-card transition-smooth hover:shadow-glow">
                <button onClick={() => openDetails(item.movie_id)} className="block w-full text-left">
                  <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
                    {item.poster_path ? (
                      <img
                        src={posterUrl(item.poster_path, "w500") ?? ""}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-smooth group-hover:brightness-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="line-clamp-1 text-sm font-medium">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.release_date?.slice(0, 4) || "—"} · ⭐ {item.vote_average?.toFixed(1) ?? "N/A"}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => remove(item.movie_id)}
                  className="absolute top-2 right-2 rounded-full bg-background/90 p-2 opacity-0 transition-smooth group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <MovieDetails movie={selected} onClose={() => setSelected(null)} onSelect={setSelected} />
    </div>
  );
};

export default WatchlistPage;
