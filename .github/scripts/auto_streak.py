#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub Actions Auto Streak Script (v2.0)
- Multi-repository rotation (5 target repos)
- Prioritas eksekusi jam pagi (WIB)
- Variasi pesan commit realistis
- Dukungan notifikasi WhatsApp (CallMeBot)
"""

import os
import sys
import json
import time
import random
import tempfile
import shutil
import urllib.request
import urllib.parse
import urllib.error
import subprocess
from datetime import datetime, timezone, timedelta

# Daftar repository publik target rotasi
ROTATION_REPOS = [
    {"name": "motorsport-live-schedule", "branch": "main", "file": "README.md"},
    {"name": "samurai-analytics", "branch": "main", "file": "README.md"},
    {"name": "ChronoStream", "branch": "main", "file": "README.md"},
    {"name": "dashboard-desa", "branch": "main", "file": "README.md"},
    {"name": "seafarer-logistic-company", "branch": "main", "file": "README.md"}
]

# Variasi pesan commit realistis
COMMIT_MESSAGE_PAIRS = [
    (
        "docs: update documentation formatting references",
        "docs: finalize readme typography consistency"
    ),
    (
        "docs: refresh readme structure and badge links",
        "docs: sync documentation styling details"
    ),
    (
        "style: align markdown sections and spacing",
        "style: format readme document hierarchy"
    ),
    (
        "chore(docs): clean up markdown trailing formatting",
        "chore(docs): polish documentation layout"
    )
]

def get_today_contributions(username: str, token: str, offset_hours: int = 7) -> tuple[int, str]:
    tz = timezone(timedelta(hours=offset_hours))
    now = datetime.now(tz)
    start_iso = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    end_iso = now.isoformat()
    today_str = now.strftime("%Y-%m-%d")

    query = """
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
    """
    payload = json.dumps({
        "query": query,
        "variables": {"login": username, "from": start_iso, "to": end_iso}
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "User-Agent": "GitHubAutoStreakAction/2.0",
            "Content-Type": "application/json",
        }
    )

    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    if "errors" in data:
        raise RuntimeError(f"GraphQL Error: {data['errors']}")

    count = (
        data.get("data", {})
        .get("user", {})
        .get("contributionsCollection", {})
        .get("contributionCalendar", {})
        .get("totalContributions", 0)
    )
    return count, today_str

def run_git(args: list[str], cwd: str = ".") -> str:
    res = subprocess.run(["git"] + args, cwd=cwd, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        err = res.stderr.strip() or res.stdout.strip()
        raise RuntimeError(f"git {' '.join(args)} gagal di {cwd}: {err}")
    return res.stdout.strip()

def send_whatsapp_notif(phone: str, apikey: str, repo_name: str, today_str: str, new_count: int):
    if not phone or not apikey:
        return
    msg = (
        f"🟢 *GitHub Auto Streak Report*\n\n"
        f"📅 Tanggal: {today_str} (WIB)\n"
        f"🎯 Repo Target: *{repo_name}*\n"
        f"🚀 Status: 2 commit net-zero berhasil dipush!\n"
        f"🔥 Total Kontribusi Hari Ini: {new_count}\n"
        f"✅ Streak aman sentosa, bro!"
    )
    params = urllib.parse.urlencode({"phone": phone, "text": msg, "apikey": apikey})
    url = f"https://api.callmebot.com/whatsapp.php?{params}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "GitHubAutoStreakBot/2.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            print("[✓] Notifikasi WhatsApp berhasil terkirim ke HP!")
    except Exception as e:
        print(f"[!] Gagal mengirim WhatsApp: {e}")

def main():
    username = os.environ.get("GITHUB_USERNAME", "fiizam").strip()
    token = os.environ.get("GH_TOKEN", "").strip()
    target_daily = int(os.environ.get("TARGET_DAILY", "2"))
    force_run = os.environ.get("FORCE_RUN", "false").lower() == "true"
    wa_phone = os.environ.get("WA_PHONE", "").strip()
    wa_apikey = os.environ.get("WA_APIKEY", "").strip()

    if not token:
        print("[ERROR] Secret 'PAT_TOKEN' belum terpasang!")
        sys.exit(1)

    print(f"[*] Memeriksa kontribusi GitHub untuk @{username}...")
    count, today_str = get_today_contributions(username, token, offset_hours=7)
    print(f"[*] Tanggal hari ini (WIB): {today_str}")
    print(f"[*] Kontribusi tercatat   : {count} (Target harian: {target_daily})")

    if not force_run and count >= target_daily:
        print(f"[✓] Kontribusi hari ini sudah cukup ({count}/{target_daily}). Tidak perlu commit tambahan.")
        return

    # Random jitter di pagi hari (10-120 detik) agar jam commit terlihat alami
    if not force_run:
        jitter_sec = random.randint(10, 90)
        print(f"[*] Menerapkan jitter alami {jitter_sec} detik...")
        time.sleep(jitter_sec)

    # Pilih repository target secara deterministik per hari tapi variatif
    date_int = int(today_str.replace("-", ""))
    selected_repo_idx = date_int % len(ROTATION_REPOS)
    target_repo_info = ROTATION_REPOS[selected_repo_idx]
    target_repo_name = target_repo_info["name"]
    target_branch = target_repo_info["branch"]
    target_file = target_repo_info["file"]

    print(f"[*] Hari ini terpilih repo rotasi: {target_repo_name} (branch: {target_branch})")

    # Pilih variasi commit message secara acak
    msg_pair = random.choice(COMMIT_MESSAGE_PAIRS)

    # Cek apakah repo target adalah repo lokal saat ini (motorsport-live-schedule)
    is_current_repo = (target_repo_name == "motorsport-live-schedule")
    work_dir = "."
    temp_dir = None

    try:
        if not is_current_repo:
            temp_dir = tempfile.mkdtemp(prefix="streak_repo_")
            repo_clone_url = f"https://x-access-token:{token}@github.com/{username}/{target_repo_name}.git"
            print(f"[*] Melakukan clone ringan untuk {target_repo_name}...")
            run_git(["clone", "--depth", "1", "--branch", target_branch, repo_clone_url, temp_dir])
            work_dir = temp_dir
            # Set identitas git di folder klon
            run_git(["config", "user.name", username], cwd=work_dir)
            run_git(["config", "user.email", "youngpiz890@gmail.com"], cwd=work_dir)

        file_full_path = os.path.join(work_dir, target_file)
        if not os.path.exists(file_full_path):
            raise FileNotFoundError(f"File {target_file} tidak ditemukan di {target_repo_name}")

        with open(file_full_path, "r", encoding="utf-8") as f:
            original = f.read()

        if len(original) < 5:
            raise ValueError(f"Isi file {target_file} terlalu pendek.")

        # Modifikasi 1 karakter di akhir
        modified = original[:-1]

        # COMMIT 1
        with open(file_full_path, "w", encoding="utf-8") as f:
            f.write(modified)
        run_git(["add", target_file], cwd=work_dir)
        run_git(["commit", "-m", msg_pair[0]], cwd=work_dir)
        print(f"[1/2] Mendorong commit 1 ke {target_repo_name}...")
        run_git(["push", "origin", target_branch], cwd=work_dir)
        print("[✓] Commit 1 terdorong (+1 kontribusi)")

        time.sleep(3)

        # COMMIT 2 (Kembalikan 100% utuh)
        with open(file_full_path, "w", encoding="utf-8") as f:
            f.write(original)
        run_git(["add", target_file], cwd=work_dir)
        run_git(["commit", "-m", msg_pair[1]], cwd=work_dir)
        print(f"[2/2] Mendorong commit 2 ke {target_repo_name}...")
        run_git(["push", "origin", target_branch], cwd=work_dir)
        print("[✓] Commit 2 terdorong (+1 kontribusi)")
        print(f"[✓] SUKSES! File {target_file} di {target_repo_name} kembali 100% utuh.")

        # Kirim notifikasi WhatsApp jika token ada
        new_count = count + 2
        send_whatsapp_notif(wa_phone, wa_apikey, target_repo_name, today_str, new_count)

    finally:
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    main()
