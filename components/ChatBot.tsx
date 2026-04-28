import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Movie, posterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  movies?: Movie[];
}

interface Props {
  onSelectMovie: (m: Movie) => void;
}

const SUGGESTIONS = [
  "A funny movie like Hangover",
  "Sad romantic movie for tonight",
  "Best thriller under 2 hours",
  "Sci-fi with plot twists",
];

export const ChatBot = ({ onSelectMovie }: Props) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm your movie concierge. Tell me what you're in the mood for — a genre, a vibe, or a movie you loved.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMsg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("movie-chat", {
        body: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "Here are some picks.",
          movies: data.movies ?? [],
        },
      ]);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Couldn't reach the AI.";
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry — ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-smooth hover:scale-110"
        aria-label="Open AI chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[min(600px,80vh)] w-[min(400px,calc(100vw-3rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <header className="flex items-center gap-2 border-b border-border bg-gradient-to-r from-primary/20 to-transparent p-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-bold">AI Movie Concierge</h3>
              <p className="text-xs text-muted-foreground">Ask in plain English</p>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  {m.movies && m.movies.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {m.movies.map((mv) => (
                        <button
                          key={mv.id}
                          onClick={() => onSelectMovie(mv)}
                          className="group overflow-hidden rounded-md bg-background text-left transition-smooth hover:scale-[1.03]"
                        >
                          <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
                            {mv.poster_path ? (
                              <img
                                src={posterUrl(mv.poster_path, "w200") ?? ""}
                                alt={mv.title}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="p-1.5">
                            <p className="line-clamp-1 text-xs font-semibold">{mv.title}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {mv.release_date?.slice(0, 4) ?? "—"} · ⭐ {mv.vote_average?.toFixed(1)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-smooth hover:border-primary hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. a funny movie like Hangover"
              className="flex-1 rounded-md bg-secondary px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-smooth hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
