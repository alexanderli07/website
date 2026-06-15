import { useEffect, useState } from "react";

interface Coin {
  symbol: string;
  price: number;
  change: number;
}

const COINS = [
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "solana", symbol: "SOL" },
];

const URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";

const fmtUsd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 10 ? 2 : 0,
  }).format(n);

/**
 * A genuinely live crypto ticker (free, no-key CoinGecko API). Refreshes every
 * 60s and degrades gracefully — if the API is unreachable it shows an honest
 * note rather than a broken/empty state. Real data only; nothing is faked.
 */
export function LiveMarkets() {
  const [coins, setCoins] = useState<Coin[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [updated, setUpdated] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(URL, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        setCoins(
          COINS.map((c) => ({
            symbol: c.symbol,
            price: data[c.id]?.usd ?? 0,
            change: data[c.id]?.usd_24h_change ?? 0,
          })),
        );
        setStatus("ok");
        setUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        if (alive) setStatus((s) => (s === "ok" ? "ok" : "error"));
      }
    };
    load();
    const t = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="data-card markets">
      <div className="markets-head">
        <span className="markets-live">
          <span className={`dot-live ${status === "ok" ? "on" : ""}`} />
          {status === "ok" ? "LIVE" : status === "loading" ? "CONNECTING" : "OFFLINE"}
        </span>
        <span className="markets-src">crypto · CoinGecko</span>
      </div>

      {status === "error" ? (
        <p className="markets-fallback">
          Live market data isn't reachable right now — it streams in real time from CoinGecko when available.
        </p>
      ) : (
        <ul className="markets-list">
          {(coins ?? COINS.map((c) => ({ symbol: c.symbol, price: 0, change: 0 }))).map((c) => (
            <li key={c.symbol}>
              <span className="m-sym">{c.symbol}</span>
              <span className="m-price">{coins ? fmtUsd(c.price) : "—"}</span>
              <span className={`m-chg ${c.change >= 0 ? "up" : "down"}`}>
                {coins ? `${c.change >= 0 ? "▲" : "▼"} ${Math.abs(c.change).toFixed(2)}%` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="markets-foot">{status === "ok" ? `updated ${updated} · 24h change` : " "}</div>
    </div>
  );
}
