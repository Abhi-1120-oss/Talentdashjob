import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({ value, duration = 800, suffix = "", decimals = 0 }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (value - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString("en-IN");

  return (
    <span className="tabular-nums animate-count-up">
      {formatted}
      {suffix}
    </span>
  );
}
