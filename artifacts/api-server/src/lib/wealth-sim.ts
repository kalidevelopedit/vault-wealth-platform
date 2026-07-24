/**
 * Deterministic Wealth Builder growth simulation.
 *
 * Generates a reproducible sequence of simulated trades (every 3-4 hours)
 * for an investment. Individual trades win or lose, but the cumulative value
 * at the end of each elapsed day always lands exactly on the plan's daily
 * growth target, so at maturity the value equals principal + expectedReturn.
 *
 * Everything is seeded by the investment id, so all endpoints (summary,
 * holdings, performance detail) stay perfectly in sync with no cron jobs.
 */

export interface WbTrade {
  time: string;        // ISO timestamp
  symbol: string;
  side: "long" | "short";
  pnl: number;         // realized P/L of this trade in USD
  win: boolean;
}

export interface WbPoint {
  time: string;        // ISO timestamp
  value: number;       // cumulative plan value in USD
}

export interface WbSimResult {
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  series: WbPoint[];
  trades: WbTrade[];
}

const TRADE_SYMBOLS = ["BTC/USD", "ETH/USD", "SOL/USD", "EUR/USD", "GBP/USD", "XAU/USD", "NVDA", "AAPL", "TSLA", "SPX500", "US30", "USD/JPY"];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface WbInvestmentLike {
  id: number;
  amount: string | number;
  durationDays: number;
  apyPercent: string | number;   // total % over the full duration
  startedAt: Date | string;
  maturesAt: Date | string;
}

/**
 * Simulate the full trade history for an investment up to `now`
 * (clamped to maturity).
 */
export function simulateWealthBuilder(inv: WbInvestmentLike, now: Date = new Date()): WbSimResult {
  const principal = typeof inv.amount === "string" ? parseFloat(inv.amount) : inv.amount;
  const totalPct = typeof inv.apyPercent === "string" ? parseFloat(inv.apyPercent) : inv.apyPercent;
  const start = new Date(inv.startedAt).getTime();
  const matures = new Date(inv.maturesAt).getTime();
  const end = Math.min(now.getTime(), matures);
  const durationDays = inv.durationDays;
  const dailyDelta = (principal * totalPct) / 100 / durationDays; // linear daily target

  const rng = mulberry32(inv.id * 2654435761 + 97);

  const series: WbPoint[] = [{ time: new Date(start).toISOString(), value: round2(principal) }];
  const trades: WbTrade[] = [];

  let value = principal;

  for (let day = 0; day < durationDays; day++) {
    const dayStart = start + day * 86400000;
    const dayEnd = Math.min(dayStart + 86400000, matures);

    // Trade times: every 3-4 hours within the day.
    const times: number[] = [];
    let t = dayStart;
    while (true) {
      t += (3 + rng()) * 3600000; // 3-4h gap
      if (t >= dayEnd) break;
      times.push(t);
    }
    if (times.length === 0) times.push(dayStart + (dayEnd - dayStart) / 2);

    // Raw per-trade results: mix of wins and losses.
    const raw = times.map(() => (rng() * 2 - 1) * dailyDelta * 0.9);
    // Force at least one loss and one win per day so it looks like real trading.
    if (raw.length >= 2) {
      if (!raw.some(r => r < 0)) raw[Math.floor(rng() * raw.length)] = -Math.abs(raw[0] || dailyDelta * 0.3) - dailyDelta * 0.15;
      if (!raw.some(r => r > 0)) raw[Math.floor(rng() * raw.length)] = Math.abs(raw[raw.length - 1] || dailyDelta * 0.3) + dailyDelta * 0.15;
    }
    // Shift so the day nets exactly the daily target.
    const sum = raw.reduce((a, b) => a + b, 0);
    const shift = (dailyDelta - sum) / raw.length;
    const pnls = raw.map(r => r + shift);

    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      const pnl = pnls[i];
      value += pnl;
      const point = { time: new Date(time).toISOString(), value: round2(value) };
      const trade: WbTrade = {
        time: point.time,
        symbol: TRADE_SYMBOLS[Math.floor(rng() * TRADE_SYMBOLS.length)],
        side: rng() > 0.42 ? "long" : "short",
        pnl: round2(pnl),
        win: pnl >= 0,
      };
      if (time <= end) {
        series.push(point);
        trades.push(trade);
      }
    }

    // Snap the end-of-day value exactly onto the daily target curve.
    const dayTargetValue = principal + dailyDelta * (day + 1);
    value = dayTargetValue;
    if (dayEnd <= end) {
      series.push({ time: new Date(dayEnd).toISOString(), value: round2(dayTargetValue) });
    }
  }

  // If matured, force the exact final payout value.
  if (end >= matures) {
    const finalValue = round2(principal * (1 + totalPct / 100));
    if (series.length) series[series.length - 1] = { time: new Date(matures).toISOString(), value: finalValue };
  }

  const currentValue = series.length ? series[series.length - 1].value : round2(principal);
  const pnl = round2(currentValue - principal);
  const pnlPercent = principal > 0 ? round2((pnl / principal) * 100) : 0;

  return { currentValue, pnl, pnlPercent, series, trades: trades.reverse() };
}

/** Current live value of an investment (same math as the full simulation). */
export function wealthBuilderCurrentValue(inv: WbInvestmentLike, now: Date = new Date()): number {
  return simulateWealthBuilder(inv, now).currentValue;
}
