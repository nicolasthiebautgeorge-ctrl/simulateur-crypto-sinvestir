"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Volume2, VolumeX } from "lucide-react";
import type { AdvisorContext, AdvisorMessage } from "@/lib/advisor/types";
import { answerWithMock } from "@/lib/advisor/mockAdvisor";
import { CoachAvatar, type CoachState } from "@/components/advisor/CoachAvatar";

interface CoachPanelProps {
  context: AdvisorContext;
}

const SUGGESTIONS = [
  "Quel est le risque ?",
  "Et si j'avais paniqué ?",
  "Pourquoi le DCA ?",
  "C'est mieux qu'un ETF ?",
];

/** Repli gratuit : synthèse vocale fr-FR du navigateur (Web Speech API). */
function speakWebSpeech(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[\p{Emoji}]/gu, ""));
  u.lang = "fr-FR";
  const frVoice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang?.toLowerCase().startsWith("fr"));
  if (frVoice) u.voice = frVoice;
  window.speechSynthesis.speak(u);
  return true;
}

export function CoachPanel({ context }: CoachPanelProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>(() => [
    answerWithMock([], context).reply,
  ].map((content) => ({ role: "assistant" as const, content })));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Coupe la voix (audio + Web Speech) au démontage.
  useEffect(() => {
    return () => stopVoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopVoice() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  /** Repli Web Speech avec suivi de l'état "parle". */
  function fallbackVoice(text: string) {
    const ok = speakWebSpeech(text);
    if (!ok || typeof window === "undefined") {
      setSpeaking(false);
      return;
    }
    const synth = window.speechSynthesis;
    const poll = setInterval(() => {
      if (!synth.speaking) {
        clearInterval(poll);
        setSpeaking(false);
      }
    }, 250);
  }

  /** Voix neuronale OpenAI (via /api/tts) ; repli Web Speech si indispo. */
  async function say(text: string) {
    if (!voiceOn) return;
    stopVoice();
    setSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && type.includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        const cleanup = () => {
          URL.revokeObjectURL(url);
          if (audioRef.current === audio) audioRef.current = null;
          setSpeaking(false);
        };
        audio.onended = cleanup;
        audio.onerror = cleanup;
        await audio.play();
        return;
      }
    } catch {
      // ignore → repli
    }
    fallbackVoice(text);
  }

  async function send(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    const next: AdvisorMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context }),
      });
      const data = (await res.json()) as { reply?: string };
      const reply =
        data.reply ?? answerWithMock(next, context).reply;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      say(reply);
    } catch {
      const reply = answerWithMock(next, context).reply;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      say(reply);
    } finally {
      setLoading(false);
    }
  }

  const coachState: CoachState = loading
    ? "thinking"
    : speaking
      ? "speaking"
      : "idle";

  return (
    <div className="rounded-2xl border border-gold/25 bg-gold/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CoachAvatar state={coachState} />
          <div className="leading-tight">
            <h3 className="flex items-center gap-1.5 font-display text-base font-semibold">
              <Sparkles className="h-4 w-4 text-gold" />
              Coach S&apos;investir IA
            </h3>
            <p className="text-xs text-text-muted">
              Pédagogique — pas un conseil en investissement.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (voiceOn) stopVoice();
            setVoiceOn((v) => !v);
          }}
          aria-pressed={voiceOn}
          aria-label={voiceOn ? "Couper la voix" : "Activer la voix"}
          title={voiceOn ? "Couper la voix" : "Activer la voix"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 ${
            voiceOn
              ? "border-gold bg-gold/15 text-gold"
              : "border-white/10 bg-surface-soft/40 text-text-muted hover:text-text"
          }`}
        >
          {voiceOn ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 flex max-h-72 flex-col gap-3 overflow-y-auto pr-1"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <p
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-brand/20 text-text"
                  : "border border-white/10 bg-surface-soft/50 text-text-subtle"
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {loading ? (
          <div className="flex justify-start">
            <p className="rounded-2xl border border-white/10 bg-surface-soft/50 px-3.5 py-2.5 text-sm text-text-muted">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce [animation-delay:0.15s]">•</span>
                <span className="animate-bounce [animation-delay:0.3s]">•</span>
              </span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            disabled={loading}
            className="rounded-full border border-white/10 bg-surface-soft/40 px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-gold/40 hover:text-text disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose ta question au coach…"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-surface-soft/40 px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-gold/50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Envoyer"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-surface transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
