export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  credits?: {
    cast: { id: number; name: string; character: string }[];
  };
}

export const posterUrl = (path: string | null, size: "w200" | "w500" | "original" = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/tmdb`;

async function call<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(FUNCTIONS_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TMDB request failed: ${res.status} ${body}`);
  }
  return (await res.json()) as T;
}

export const fetchTrending = () =>
  call<{ results: Movie[] }>({ action: "trending" }).then((r) => r.results);

export const searchMovies = (query: string) =>
  call<{ results: Movie[] }>({ action: "search", query }).then((r) => r.results);

export const fetchDetails = (id: number) =>
  call<Movie>({ action: "details", id: String(id) });

export const fetchRecommendations = (id: number) =>
  call<{ results: Movie[] }>({ action: "recommendations", id: String(id) }).then((r) => r.results);

export const fetchByGenres = (genreIds: number[]) =>
  call<{ results: Movie[] }>({ action: "discover", genres: genreIds.join(",") }).then((r) => r.results);

export interface Video {
  id: string;
  key: string;
  site: string;
  type: string;
  name: string;
  official: boolean;
}

export const fetchVideos = (id: number) =>
  call<{ results: Video[] }>({ action: "videos", id: String(id) }).then((r) => r.results);

export const fetchBatch = (ids: number[]) =>
  ids.length === 0
    ? Promise.resolve([])
    : call<{ results: Movie[] }>({ action: "batch", ids: ids.join(",") }).then((r) => r.results);
