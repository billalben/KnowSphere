import { useCallback } from "react";
import confetti from "canvas-confetti";

const PARTICLE_COUNT = 200;
const DEFAULTS: confetti.Options = { origin: { y: 0.7 } };

function fire(particleRatio: number, opts: confetti.Options) {
  confetti({
    ...DEFAULTS,
    ...opts,
    particleCount: Math.floor(PARTICLE_COUNT * particleRatio),
  });
}

export function useConfetti() {
  const trigger = useCallback(() => {
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  return trigger;
}
