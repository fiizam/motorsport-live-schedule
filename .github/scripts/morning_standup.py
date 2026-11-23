#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Morning Standup Automation (08:00 WIB Daily)
Runs 100% autonomously in GitHub Actions Cloud.
Pings Telegram with daily streak status & upcoming F1 race schedule.
"""

import os
import sys
import json
import random
import urllib.request
from datetime import datetime, timezone, timedelta

CONFIG = {
    "github_token": os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN", ""),
    "github_username": os.environ.get("GITHUB_USERNAME", "fiizam"),
    "telegram_bot_token": os.environ.get("TELEGRAM_BOT_TOKEN", ""),
    "telegram_chat_id": str(os.environ.get("TELEGRAM_CHAT_ID", "6875762951")),
}

QUOTES = [
    "Konsistensi kecil tiap hari bakal jadi portofolio raksasa di masa depan. Gas ngoding!",
    "Bugs are just undocumented features waiting to be perfected. Tetap tenang & debug santai.",
    "Bikin kode yang bersih biar diri lu 6 bulan lagi berterima kasih. Semangat bro!",
    "Laptop lu boleh mati, tapi streak & cloud bot lu tetap abadi. Have a productive day!",
    "Commit hari ini lebih berharga daripada 100 rencana tanpa eksekusi. Jangan lupa ngopi!"
]

def send_telegram(text):
    token = CONFIG["telegram_bot_token"]
    chat_id = CONFIG["telegram_chat_id"]
    if not token or not chat_id:
        print("[!] Token Telegram atau Chat ID kosong!")
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print("[✓] Morning standup berhasil dikirim ke Telegram!")
            return True
    except Exception as e:
        print(f"[!] Gagal kirim Telegram: {e}")
        return False

def get_today_contributions():
    token = CONFIG["github_token"]
    user = CONFIG["github_username"]
    tz = timezone(timedelta(hours=7))
    now = datetime.now(tz)
    start_iso = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    end_iso = now.isoformat()

    query = """
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar { totalContributions }
        }
      }
    }
    """
    payload = json.dumps({"query": query, "variables": {"login": user, "from": start_iso, "to": end_iso}}).encode("utf-8")
    req = urllib.request.Request("https://api.github.com/graphql", data=payload, headers={
        "Authorization": f"Bearer {token}",
        "User-Agent": "FiiStandup/1.0"
    })
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())
            count = data.get("data", {}).get("user", {}).get("contributionsCollection", {}).get("contributionCalendar", {}).get("totalContributions", 0)
            return count, now.strftime("%d %b %Y, %H:%M WIB")
    except Exception as e:
        print(f"[!] GraphQL error: {e}")
        return 0, now.strftime("%d %b %Y, %H:%M WIB")

def get_upcoming_f1_race():
    wib_tz = timezone(timedelta(hours=7))
    now_wib = datetime.now(wib_tz)
    races = []

    # Coba live API Jolpica
    try:
        req = urllib.request.Request("https://api.jolpi.ca/ergast/f1/current.json", headers={"User-Agent": "FiiStandup/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            races = json.loads(resp.read().decode()).get("MRData", {}).get("RaceTable", {}).get("Races", [])
    except Exception as e:
        print(f"[!] Live API Jolpica offline ({e}), membaca file fallback...")

    # Fallback ke file lokal jika API offline
    if not races:
        possible_paths = [
            "jolpica-2026.json",
            os.path.join(os.path.dirname(__file__), "../../jolpica-2026.json")
        ]
        for p in possible_paths:
            if os.path.exists(p):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        races = json.load(f).get("MRData", {}).get("RaceTable", {}).get("Races", [])
                    break
                except Exception:
                    pass

    for r in races:
        r_date_str = r.get("date", "")
        r_time_str = r.get("time", "00:00:00Z").replace("Z", "")
        try:
            dt_utc = datetime.fromisoformat(f"{r_date_str}T{r_time_str}+00:00")
            dt_wib = dt_utc.astimezone(wib_tz)
            if dt_wib > now_wib:
                diff = dt_wib - now_wib
                days = diff.days
                hours = diff.seconds // 3600
                return {
                    "round": r.get("round"),
                    "name": r.get("raceName"),
                    "circuit": r.get("Circuit", {}).get("circuitName", ""),
                    "country": r.get("Circuit", {}).get("Location", {}).get("country", ""),
                    "race_wib": dt_wib.strftime("%d %b %Y, %H:%M WIB"),
                    "countdown": f"{days} hari {hours} jam lagi" if days > 0 else f"{hours} jam lagi!"
                }
        except Exception:
            continue
    return None

def main():
    print("=== Menjalankan Morning Standup (08:00 WIB) ===")
    count, date_str = get_today_contributions()
    race = get_upcoming_f1_race()
    quote = random.choice(QUOTES)

    if count > 0:
        streak_status = f"✅ *Kotak Hijau Nyala!* ({count} kontribusi)"
    else:
        streak_status = "⏳ *Belum Ada Commit* (Tenang, auto-streak standby nanti malam)"

    race_section = ""
    if race:
        race_section = (
            f"🏎️ *Highlight F1 Pekan Ini:*\n"
            f"• Seri: *{race['name']}* (Round {race['round']})\n"
            f"• Sirkuit: {race['circuit']}, {race['country']}\n"
            f"• 🏁 Balapan: *{race['race_wib']}*\n"
            f"• ⏳ Waktu: *{race['countdown']}*\n\n"
        )

    msg = (
        f"☀️ *Selamat Pagi Bro Zamzari! (08:00 WIB)*\n\n"
        f"📊 *Laporan GitHub Hari Ini:*\n"
        f"• Status: {streak_status}\n"
        f"• Waktu Cek: `{date_str}`\n\n"
        f"{race_section}"
        f"💡 *Quote Pagi:*\n"
        f"_{quote}_\n\n"
        f"Cloud standby 24/7 bro, laptop mati pun semua sistem tetap jalan normal! 🚀"
    )

    send_telegram(msg)

if __name__ == "__main__":
    main()
