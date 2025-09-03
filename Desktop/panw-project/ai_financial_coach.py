#!/usr/bin/env python3
"""
CashVibe AI — Console demo of an AI-powered financial coach for students.
No real data or integrations; for hackathon demo purposes only.

Run:
  python ai_financial_coach.py
  python ai_financial_coach.py --demo
  python ai_financial_coach.py --no-color
"""

import argparse
import sys
import time

# ----- Optional colors via colorama -----
USE_COLOR = True
try:
    from colorama import init as colorama_init, Fore, Style
    colorama_init()
except Exception:
    # Fallback if colorama isn't installed/available
    USE_COLOR = False
    class _Dummy:
        def __getattr__(self, _): return ""
    Fore = Style = _Dummy()

def ctext(text, color=""):
    if not USE_COLOR or not color:
        return text
    return color + text + Style.RESET_ALL

# ----- Core App -----
class AIFinancialCoach:
    def __init__(self, demo: bool = False):
        self.demo = demo
        self.user_data = {}
        self.tips = [
            "Save a bit from your part-time gig for a rainy day (or a coffee fund)! ☕",
            "Try the snowball method to crush that spring break credit card debt! 💳",
            "Invest spare change in low-cost index funds to grow while you study! 📈",
        ]

    # ---------- UI Helpers ----------
    def _divider(self):
        print(ctext("=" * 39, Fore.CYAN if USE_COLOR else ""))

    def _ascii_logo(self):
        logo = r"""
 _____           _     __     _ _      
/  __ \         | |   / _|   | | |     
| /  \/ __ _  __| |  | |_ ___| | | ___ 
| |    / _` |/ _` |  |  _/ _ \ | |/ _ \
| \__/\ (_| | (_| |  | ||  __/ | |  __/
 \____/\__,_|\__,_|  |_| \___|_|_|\___|
"""
        for line in logo.splitlines():
            print(ctext(line, Fore.YELLOW if USE_COLOR else ""))

    def _spinner(self, msg="Analyzing"):
        print(ctext(f"\n=== 📊 {msg} ===", Fore.CYAN if USE_COLOR else ""))
        print(ctext("Analyzing", Fore.YELLOW if USE_COLOR else ""), end="", flush=True)
        for _ in range(3):
            time.sleep(0.5)
            print(".", end="", flush=True)
        print()

    def _bar(self, pct: float, width: int = 20) -> str:
        pct = max(0.0, min(100.0, pct))
        filled = int((pct / 100.0) * width)
        return "[" + "=" * filled + ">" + " " * max(0, width - filled - 1) + f"] {pct:5.1f}%"

    # ---------- Input ----------
    def _prompt_float(self, label: str, default: float) -> float:
        if self.demo:
            print(f"{label}: {default}")
            return float(default)

        while True:
            raw = input(ctext(f"{label} (press Enter for {default}): ", Fore.GREEN if USE_COLOR else ""))
            if raw.strip() == "":
                return float(default)
            try:
                val = float(raw)
                if val < 0:
                    print(ctext("Value cannot be negative. Try again.", Fore.RED if USE_COLOR else ""))
                    continue
                return val
            except ValueError:
                print(ctext("Please enter a valid number.", Fore.RED if USE_COLOR else ""))

    # ---------- Flow ----------
    def welcome_user(self):
        self._divider()
        self._ascii_logo()
        self._divider()
        print(ctext("Yo, what's good? Welcome to CashVibe AI! 🎉", Fore.GREEN if USE_COLOR else ""))
        print("Your pocket-friendly buddy to *slay* your money game.")
        print("Dodge ramen budgets, stack savings for that post-grad trip. 🌴")
        print(ctext("Let’s make those dollars *vibe*! 💸", Fore.MAGENTA if USE_COLOR else ""))
        time.sleep(0.8)

    def collect_user_data(self):
        print(ctext("\n=== 💰 Spill the Tea on Your Finances (demo mode is chill) ===",
                    Fore.CYAN if USE_COLOR else ""))
        self.user_data["income"] = self._prompt_float("Monthly income", 500.0)
        self.user_data["expenses"] = self._prompt_float("Monthly expenses", 300.0)
        self.user_data["savings_goal"] = self._prompt_float("Savings goal", 1000.0)

        print(ctext("\n🎉 Got your financial vibes! Here’s the rundown:", Fore.YELLOW if USE_COLOR else ""))
        inc = self.user_data["income"]
        exp = self.user_data["expenses"]
        goal = self.user_data["savings_goal"]
        print(f"Income: ${inc:,.2f} | Expenses: ${exp:,.2f} | Goal: ${goal:,.2f}")

    def analyze_finances(self):
        self._spinner("Crunching Your Numbers Like a Pro")
        inc = self.user_data["income"]
        exp = self.user_data["expenses"]

        if inc == 0:
            print(ctext("Savings rate: N/A (income is 0 in this demo).", Fore.RED if USE_COLOR else ""))
            return

        savings_rate = (inc - exp) / inc * 100.0
        print(ctext(f"\nYour savings vibe is {savings_rate:.1f}%! (mock calculation)",
                    Fore.GREEN if USE_COLOR else ""))

        # A playful gauge
        print(ctext(self._bar(max(0.0, min(100.0, savings_rate))), Fore.YELLOW if USE_COLOR else ""))

        if savings_rate < 0:
            print(ctext("Uh oh—spending exceeds income. Time to triage essentials. 😬",
                        Fore.RED if USE_COLOR else ""))
        elif savings_rate < 10:
            print(ctext("Let’s start small: clip a few recurring costs and build momentum.",
                        Fore.RED if USE_COLOR else ""))
        elif savings_rate < 20:
            print(ctext("Nice start—push a little more to hit that 20% milestone.",
                        Fore.MAGENTA if USE_COLOR else ""))
        else:
            print(ctext("🚀 You’re absolutely *killing* it! Keep those savings flowing!",
                        Fore.GREEN if USE_COLOR else ""))

    def provide_advice(self):
        print(ctext("\n=== 🔥 Hot Financial Tips for You ===", Fore.CYAN if USE_COLOR else ""))
        for i, tip in enumerate(self.tips, 1):
            print(ctext(f"Tip #{i}: ", Fore.MAGENTA if USE_COLOR else "") + tip)
        print(ctext("Note: Demo mode—real tips would be *next-level* personalized!",
                    Fore.YELLOW if USE_COLOR else ""))

    def run(self):
        self.welcome_user()
        self.collect_user_data()
        self.analyze_finances()
        self.provide_advice()
        self._divider()
        print(ctext("Thanks for chilling with CashVibe AI! 🌟", Fore.GREEN if USE_COLOR else ""))
        print("Come back to level up your money game! 💪")

# ----- Main Entrypoint -----
def parse_args(argv):
    p = argparse.ArgumentParser(description="CashVibe AI — demo console app")
    p.add_argument("--demo", action="store_true",
                   help="Run with defaults (no interactive inputs).")
    p.add_argument("--no-color", action="store_true",
                   help="Disable colored output.")
    return p.parse_args(argv)

def main(argv=None):
    global USE_COLOR
    args = parse_args(argv or sys.argv[1:])
    if args.no_color:
        USE_COLOR = False
    app = AIFinancialCoach(demo=args.demo)
    app.run()

if __name__ == "__main__":
    main()
