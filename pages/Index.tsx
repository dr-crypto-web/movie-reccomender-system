import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Film, Loader2, Search, Bookmark, LogIn, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Movie, fetchTrending, searchMovies, fetchByGenres } from "@/lib/tmdb";
import { MovieRow } from "@/components/MovieRow";
import { MovieDetails } from "@/components/MovieDetails";
import { MoodChips, Mood } from "@/components/MoodChips";
import { ChatBot } from "@/components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Index = () => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [trending, setTrending] = useState<Movie[]>([]);
  const [results, setResults] = useState<Movie[]>([]);
  const [mood, setMood] = useState<Mood | null>(null);
  const [moodResults, setMoodResults] = useState<Movie[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingMood, setLoadingMood] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    document.title = "CineFind — AI Movie Recommendations";
    const meta =
      document.querySelector('meta[name="description"]') ??
      Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute(
      "content",
      "AI-powered movie recommendations. Chat, pick a mood, or search — discover trending films and save them to your watchlist.",
    );
    document.head.appendChild(meta);
  }, []);

  useEffect(() => {
    fetchTrending()
      .then(setTrending)
      .catch((e) => {
        console.error(e);
        toast.error("Couldn't load trending movies");
      })
      .finally(() => setLoadingTrending(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced) { setResults([]); return; }
    setLoadingSearch(true);
    searchMovies(debounced)
      .then(setResults)
      .catch((e) => { console.error(e); toast.error("Search failed"); })
      .finally(() => setLoadingSearch(false));
  }, [debounced]);

  useEffect(() => {
    if (!mood) { setMoodResults([]); return; }
    setLoadingMood(true);
    fetchByGenres(mood.genres)
      .then(setMoodResults)
      .catch((e) => { console.error(e); toast.error("Mood search failed"); })
      .finally(() => setLoadingMood(false));
  }, [mood]);

  const hero = useMemo(() => trending[0], [trending]);
  const showingSearch = !!debounced;
  const showingMood = !showingSearch && !!mood;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex items-center gap-4 py-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-extrabold tracking-tight text-gradient">CineFind</span>
          </Link>
          <div className="relative ml-auto w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies..."
              className="pl-9 bg-secondary border-border focus-visible:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <Link
                  to="/watchlist"
                  className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium transition-smooth hover:border-primary"
                >
                  <Bookmark className="h-4 w-4" /> Watchlist
                </Link>
                <Link to="/watchlist" className="sm:hidden p-2 rounded-md hover:bg-secondary" aria-label="Watchlist">
                  <Bookmark className="h-5 w-5" />
                </Link>
                <button onClick={signOut} className="p-2 rounded-md hover:bg-secondary" aria-label="Sign out">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90"
              >
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {hero && !showingSearch && !showingMood && (
        <section className="relative h-[55vh] min-h-[360px] w-full overflow-hidden">
          {hero.backdrop_path && (
            <img
              src={`https://image.tmdb.org/t/p/original${hero.backdrop_path}`}
              alt={`${hero.title} backdrop`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="container relative flex h-full flex-col justify-end pb-12">
            <h1 className="max-w-2xl text-4xl sm:text-5xl font-extrabold leading-tight">
              {hero.title}
            </h1>
            <p className="mt-3 max-w-2xl line-clamp-3 text-sm sm:text-base text-muted-foreground">
              {hero.overview}
            </p>
            <button
              onClick={() => setSelected(hero)}
              className="mt-5 w-fit rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 hover:shadow-glow"
            >
              View details
            </button>
          </div>
        </section>
      )}

      <main className="container space-y-10 py-10">
        {!showingSearch && (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3">What's your mood?</h2>
            <MoodChips active={mood?.key ?? null} onSelect={setMood} />
          </section>
        )}

        {showingSearch ? (
          <SearchResults query={debounced} loading={loadingSearch} results={results} onSelect={setSelected} />
        ) : showingMood ? (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {mood?.emoji} {mood?.label} picks
            </h2>
            {loadingMood ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading...
              </div>
            ) : moodResults.length === 0 ? (
              <p className="text-muted-foreground">No movies found.</p>
            ) : (
              <Grid movies={moodResults} onSelect={setSelected} />
            )}
          </section>
        ) : loadingTrending ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading trending...
          </div>
        ) : (
          <MovieRow title="Trending This Week" movies={trending} onSelect={setSelected} />
        )}
      </main>

      <MovieDetails movie={selected} onClose={() => setSelected(null)} onSelect={setSelected} />
      <ChatBot onSelectMovie={setSelected} />

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Movie data provided by TMDB. This product uses the TMDB API but is not endorsed by TMDB.
      </footer>
    </div>
  );
};

const SearchResults = ({
  query, loading, results, onSelect,
}: { query: string; loading: boolean; results: Movie[]; onSelect: (m: Movie) => void }) => (
  <section>
    <h2 className="text-xl sm:text-2xl font-bold mb-4">Search results for "{query}"</h2>
    {loading ? (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Searching...
      </div>
    ) : results.length === 0 ? (
      <p className="text-muted-foreground">No movies found.</p>
    ) : (
      <Grid movies={results} onSelect={onSelect} />
    )}
  </section>
);

const Grid = ({ movies, onSelect }: { movies: Movie[]; onSelect: (m: Movie) => void }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {movies.map((m) => (
      <button
        key={m.id}
        onClick={() => onSelect(m)}
        className="group overflow-hidden rounded-md bg-card text-left transition-smooth hover:scale-[1.03] hover:shadow-glow"
      >
        <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
          {m.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
              alt={`${m.title} poster`}
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
          <h3 className="line-clamp-1 text-sm font-medium">{m.title}</h3>
          <p className="text-xs text-muted-foreground">
            {m.release_date?.slice(0, 4) || "—"} · ⭐ {m.vote_average?.toFixed(1)}
          </p>
        </div>
      </button>
    ))}
  </div>
);

export default Index;
