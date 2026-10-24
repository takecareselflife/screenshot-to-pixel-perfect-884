import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, HeartPulse, MapPin, RotateCcw, ShieldCheck, Sparkles, Syringe, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListenButton } from "@/components/ListenButton";
import { STI_QUESTIONS, answerSti, continueSti, initialStiState, stiAccuracy } from "@/lib/sti-game";

export function StiWisdomGame() {
  const [state, setState] = useState(initialStiState);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const question = STI_QUESTIONS[state.position];
  const finished = state.position === STI_QUESTIONS.length;
  const visualPosition = state.position + Number(state.answered && state.lastCorrect);
  useEffect(() => { questionRef.current?.focus({ preventScroll: true }); }, [state.position, state.answered]);
  const restart = () => setState(initialStiState());
  return (
    <div className="space-y-6">
      <section aria-label="Path of Wisdom" className="border-y py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
          <span>{STI_QUESTIONS.length - visualPosition} steps to the trophy</span>
          <span>{visualPosition} / {STI_QUESTIONS.length}</span>
        </div>
        <ol className="grid grid-cols-6 gap-2 sm:grid-cols-11" aria-label="Wisdom trail">
          {Array.from({ length: 11 }, (_, i) => {
            const Icon = [ShieldCheck, Syringe, HeartPulse][i % 3] ?? ShieldCheck;
            return <li key={i} aria-current={visualPosition === i ? "step" : undefined} aria-label={`${i === 10 ? "Trophy" : `Step ${i}`}${visualPosition === i ? ", you are here" : ""}`} className={`relative flex aspect-square min-w-0 items-center justify-center rounded-lg border-2 transition-colors motion-reduce:transition-none ${visualPosition === i ? "border-primary bg-secondary" : visualPosition > i ? "border-primary/30 bg-secondary/50" : "border-border bg-muted"}`}>
              {i === 10 ? <Trophy className="h-7 w-7 text-caution-foreground" aria-hidden /> : visualPosition === i ? <span role="img" aria-label="Teen player" className="text-3xl motion-safe:animate-in motion-safe:zoom-in">🧑🏽‍🎓</span> : visualPosition > i ? <Check className="h-5 w-5 text-primary" aria-hidden /> : <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />}
              <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-muted-foreground" aria-hidden>{i}</span>
            </li>;
          })}
        </ol>
      </section>

      {finished ? <section className="space-y-5 text-center" aria-live="polite">
        <Trophy className="mx-auto h-20 w-20 text-caution-foreground motion-safe:animate-in motion-safe:zoom-in" aria-hidden />
        <h2 ref={questionRef} tabIndex={-1} className="text-2xl font-semibold outline-none">You earned the Sexual Health Knowledge Trophy!</h2>
        <p>Congratulations! You completed the Path of Wisdom.</p>
        <p className="text-muted-foreground">Knowledge is protection. Sexual healthcare is your right. Information, prevention and respect help protect you and others.</p>
        <dl className="grid grid-cols-3 gap-2 border-y py-4">
          <div><dt className="text-sm text-muted-foreground">Answers given</dt><dd className="text-2xl font-bold">{state.attempts}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Correct answers</dt><dd className="text-2xl font-bold">{state.correct}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Accuracy</dt><dd className="text-2xl font-bold">{stiAccuracy(state)}%</dd></div>
        </dl>
        <ListenButton text={`You earned the Sexual Health Knowledge Trophy! ${state.attempts} answers given, ${state.correct} correct answers, ${stiAccuracy(state)} percent accuracy. Knowledge is protection. Sexual healthcare is your right.`} />
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={restart}><RotateCcw className="h-4 w-4" aria-hidden />Play again</Button>
          <Button variant="outline" asChild><Link to="/biblioteca/$slug" params={{ slug: "sti" }}>Learn more about STIs</Link></Button>
          <Button variant="outline" asChild><Link to="/servicos"><MapPin className="h-4 w-4" aria-hidden />Where to get care</Link></Button>
        </div>
      </section> : question && <section className="space-y-4">
        <p className="text-sm font-bold text-primary">Question {state.position + 1} of {STI_QUESTIONS.length} · {question.topic}</p>
        <h2 ref={questionRef} tabIndex={-1} className="text-2xl font-semibold outline-none">{question.statement}</h2>
        <ListenButton text={`${question.statement} True or false?`} />
        <div className="grid grid-cols-2 gap-3">
          <Button disabled={state.answered} onClick={() => setState(s => answerSti(s, true))} className="h-16 text-lg"><Check className="h-6 w-6" aria-hidden />True</Button>
          <Button disabled={state.answered} variant="outline" onClick={() => setState(s => answerSti(s, false))} className="h-16 text-lg"><X className="h-6 w-6" aria-hidden />False</Button>
        </div>
        {state.answered && <div aria-live="polite" className={`space-y-3 rounded-lg p-4 ${state.lastCorrect ? "bg-secondary text-secondary-foreground" : "bg-sky text-sky-foreground"}`}>
          <p className="flex items-center gap-2 font-bold">{state.lastCorrect ? <Sparkles className="h-5 w-5" aria-hidden /> : <HeartPulse className="h-5 w-5" aria-hidden />}{state.lastCorrect ? "That's right! One step closer." : "Almost! Learning is part of the journey."}</p>
          <p className="font-bold">The answer is {question.answer ? "True" : "False"}.</p>
          <p>{question.explanation}</p>
          <ListenButton text={`The answer is ${question.answer ? "True" : "False"}. ${question.explanation}`} />
          <Button onClick={() => setState(continueSti)}>{state.lastCorrect ? visualPosition === STI_QUESTIONS.length ? "Collect trophy" : "Next question" : "Try again"}<ArrowRight className="h-4 w-4" aria-hidden /></Button>
        </div>}
      </section>}
      <p className="text-sm text-muted-foreground">Educational, not a diagnosis. Your answers stay on this page and are not saved or shared.</p>
    </div>
  );
}