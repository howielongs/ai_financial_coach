// Coffee-only assessor for DoughDash
// Input: transactions = [{ Date, Merchant, Category, Amount }]
// Output: assessment object with yes/no, metrics, rationale, and suggestions
export function assessCoffeeSpending(transactions = [], config = {}) {
    const opts = {
      coffeeCategoryNames: ["Coffee"], // add others if needed
      coffeeKeywordMerchants: ["Starbucks","Peet","Peet's","Philz","Dunkin","Blue Bottle","Cafe","Coffee"],
      // thresholds (tweak as you like)
      monthly$Cap: 75,       // "above this, likely too much"
      perWeekCountCap: 5,    // >5 times per week
      surgeVs3MoPct: 0.25,   // 25% higher than 3-mo avg triggers surge
      ...config,
    };
  
    // normalize
    const tx = transactions
      .map(t => ({
        date: new Date(t.Date ?? t.date),
        merchant: String(t.Merchant ?? t.merchant ?? ""),
        category: String(t.Category ?? t.category ?? ""),
        amount: Number(t.Amount ?? t.amount) || 0,
      }))
      .filter(t => t.date.toString() !== "Invalid Date" && t.amount > 0);
  
    if (tx.length === 0) {
      return {
        ok: false,
        reason: "no_data",
        answer: "I don’t see any transactions yet.",
        details: {},
        suggestions: [],
      };
    }
  
    const monthKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  
    // classify coffee
    const isCoffee = (t) => {
      const catHit = opts.coffeeCategoryNames.some(n => t.category.toLowerCase() === n.toLowerCase());
      const merchHit = opts.coffeeKeywordMerchants.some(k => t.merchant.toLowerCase().includes(k.toLowerCase()));
      return catHit || merchHit;
    };
  
    const coffee = tx.filter(isCoffee);
    if (coffee.length === 0) {
      return {
        ok: true,
        reason: "no_coffee_found",
        answer: "No coffee purchases detected—so you're not overspending on coffee.",
        details: {},
        suggestions: [],
      };
    }
  
    // per-month rollups
    const byMonth = new Map();
    for (const t of coffee) {
      const mk = monthKey(t.date);
      if (!byMonth.has(mk)) byMonth.set(mk, { total: 0, count: 0, amounts: [] });
      const m = byMonth.get(mk);
      m.total += t.amount;
      m.count += 1;
      m.amounts.push(t.amount);
    }
    const months = [...byMonth.keys()].sort();
    const lastM = months[months.length - 1];
    const last = byMonth.get(lastM);
  
    // compute 3-mo avg total (or fewer if less data)
    const last3Keys = months.slice(-3);
    const avg3 = last3Keys.reduce((s,k)=>s + (byMonth.get(k)?.total || 0), 0) / last3Keys.length;
  
    // per-week frequency in the last month
    // Approx weeks = days in that month / 7. We'll rough-count tx/week.
    const daysInLastMonth = (() => {
      const [y, m] = lastM.split("-").map(Number);
      return new Date(y, m, 0).getDate();
    })();
    const visitsPerWeek = last.count / (daysInLastMonth / 7);
  
    // heuristics
    const overCap = last.total > opts.monthly$Cap;
    const freqHigh = visitsPerWeek > opts.perWeekCountCap;
    const surge = avg3 > 0 ? (last.total > avg3 * (1 + opts.surgeVs3MoPct)) : false;
  
    const flags = [
      overCap && `You spent $${last.total.toFixed(0)} on coffee in ${lastM} (above the $${opts.monthly$Cap} comfort cap).`,
      freqHigh && `You're buying coffee ~${visitsPerWeek.toFixed(1)}×/week (above ${opts.perWeekCountCap}×/week).`,
      surge && `Coffee spend is up ~${Math.round((last.total/avg3 - 1)*100)}% vs your 3-month average.`,
    ].filter(Boolean);
  
    const isTooMuch = flags.length > 0;
  
    // Suggestions (ranked quick wins)
    const avgTicket = last.total / Math.max(1, last.count);
    const suggestions = [
      { label: "Home-brew 1 day/week", estMonthlySave: Math.max(4, Math.round(avgTicket)) * 4 },
      { label: "Size down or skip add-ons 2×/week", estMonthlySave: Math.round(Math.max(2, avgTicket * 0.3) * 8) },
      { label: "Pick a lower-cost cafe for 2 visits/week", estMonthlySave: Math.round(Math.max(2, avgTicket * 0.25) * 8) },
      { label: "Set a monthly coffee cap", estMonthlySave: Math.max(5, Math.round(Math.max(0, last.total - opts.monthly$Cap))) },
      { label: "Use a punch-card/rewards app", estMonthlySave: 5 },
    ]
    .filter(s => s.estMonthlySave > 0)
    .sort((a,b)=>b.estMonthlySave - a.estMonthlySave)
    .slice(0, 3);
  
    const answer = isTooMuch
      ? "Yes — you’re likely overspending on coffee."
      : "No — your coffee spending looks reasonable right now.";
  
    return {
      ok: true,
      reason: isTooMuch ? "over" : "ok",
      answer,
      details: {
        month: lastM,
        monthlyTotal: Number(last.total.toFixed(2)),
        monthlyCount: last.count,
        avgTicket: Number(avgTicket.toFixed(2)),
        visitsPerWeek: Number(visitsPerWeek.toFixed(1)),
        avg3moTotal: Number((avg3 || 0).toFixed(2)),
        flags,
      },
      suggestions,
    };
  }
  