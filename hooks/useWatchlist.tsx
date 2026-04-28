import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Movie } from "@/lib/tmdb";
import { toast } from "sonner";

export interface WatchlistItem {
  id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  vote_average: number | null;
  release_date: string | null;
}

export const useWatchlist = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("watchlist")
      .select("id, movie_id, title, poster_path, vote_average, release_date")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    } else if (data) {
      setItems(data as WatchlistItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const add = async (m: Movie) => {
    if (!user) {
      toast.error("Sign in to save movies");
      return;
    }
    const { error } = await supabase.from("watchlist").insert({
      user_id: user.id,
      movie_id: m.id,
      title: m.title,
      poster_path: m.poster_path,
      vote_average: m.vote_average ?? null,
      release_date: m.release_date ?? null,
    });
    if (error) {
      if (error.code === "23505") {
        toast.info("Already in your watchlist");
      } else {
        console.error(error);
        toast.error("Couldn't save");
      }
      return;
    }
    toast.success(`Added "${m.title}" to watchlist`);
    load();
  };

  const remove = async (movieId: number) => {
    if (!user) return;
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("movie_id", movieId);
    if (error) {
      console.error(error);
      toast.error("Couldn't remove");
      return;
    }
    toast.success("Removed from watchlist");
    load();
  };

  const has = (movieId: number) => items.some((i) => i.movie_id === movieId);

  return { items, loading, add, remove, has, reload: load };
};
