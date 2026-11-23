import Header from "./components/Header";
import Hero from "./components/Hero";
import ProfileForm from "./components/ProfileForm";
import LiveAnalysis from "./components/LiveAnalysis";
import StateBlock from "./components/StateBlock";
import ToolsBlock from "./components/ToolsBlock";
import PlanBlock from "./components/PlanBlock";
import { useState } from "react";
import { useLocalStorage } from "./lib/useLocalStorage";
import { initialState, type ClientState } from "./lib/types";

export default function App() {
  const [state, setState, clear] = useLocalStorage<ClientState>("diagnostic-card:anna-maria:v1", initialState);
  // «Очистити» перемонтує блоки: відкривається перший напрямок, календар скидається
  const [resetKey, setResetKey] = useState(0);
  const update = (patch: Partial<ClientState>) => setState((s) => ({ ...s, ...patch }));

  // «Очистити»: сначала мягко прокручиваем наверх, и только потом сбрасываем данные.
  // Если сбросить сразу, страница резко укорачивается и прокрутка дёргается.
  const onClear = () => {
    const reset = () => {
      clear();
      setResetKey((k) => k + 1);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    };
    if (window.scrollY < 4) return reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
    const started = performance.now();
    const wait = () => {
      if (window.scrollY < 2 || performance.now() - started > 1500) reset();
      else requestAnimationFrame(wait);
    };
    requestAnimationFrame(wait);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <div className="bg-canvas">
          <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-4 sm:px-6">
        <Hero />

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(340px,0.8fr)_minmax(0,1.2fr)]">
          <ProfileForm state={state} update={update} />
          <LiveAnalysis state={state} update={update} blocks />
        </div>

        <StateBlock key={`state-${resetKey}`} state={state} update={update} />
          </div>
        </div>

        <div className="bg-canvas">
          <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-4 sm:px-6">
        <ToolsBlock state={state} update={update} />
        <PlanBlock key={`plan-${resetKey}`} state={state} update={update} />

        <div className="flex justify-center py-6">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClear}
            className="rounded-full border border-line bg-white px-6 py-2 text-sm font-medium text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
          >
            Очистити
          </button>
        </div>
          </div>
        </div>
      </main>
    </div>
  );
}
