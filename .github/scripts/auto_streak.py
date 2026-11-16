#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub Actions Auto Streak Script
Mengecek kontribusi harian (WIB) dan melakukan 2 commit net-zero pada target file jika belum mencapai target.
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import subprocess
from datetime import datetime, timezone, timedelta


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
            "User-Agent": "GitHubAutoStreakAction/1.0",
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


def run_git(args: list[str]) -> str:
    res = subprocess.run(["git"] + args, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        err = res.stderr.strip() or res.stdout.strip()
        raise RuntimeError(f"git {' '.join(args)} gagal: {err}")
    return res.stdout.strip()


def main():
    username = os.environ.get("GITHUB_USERNAME", "fiizam").strip()
    token = os.environ.get("GH_TOKEN", "").strip()
    target_file = os.environ.get("TARGET_FILE", "README.md").strip()
    branch = os.environ.get("TARGET_BRANCH", "main").strip()
    target_daily = int(os.environ.get("TARGET_DAILY", "2"))
    force_run = os.environ.get("FORCE_RUN", "false").lower() == "true"

    if not token:
        print("[ERROR] Repository secret 'PAT_TOKEN' belum diset!")
        print("Silakan buka repo GitHub -> Settings -> Secrets and variables -> Actions -> New repository secret")
        print("Name: PAT_TOKEN | Secret: <Personal Access Token kamu>")
        sys.exit(1)

    print(f"[*] Memeriksa kontribusi GitHub untuk @{username}...")
    count, today_str = get_today_contributions(username, token, offset_hours=7)
    print(f"[*] Tanggal hari ini (WIB): {today_str}")
    print(f"[*] Kontribusi tercatat   : {count} (Target harian: {target_daily})")

    if not force_run and count >= target_daily:
        print(f"[✓] Kontribusi hari ini sudah cukup ({count}/{target_daily}). Tidak perlu commit tambahan.")
        return

    if force_run:
        print("[!] Force mode aktif: Menjalankan commit net-zero sekarang...")
    else:
        print(f"[-] Kontribusi hari ini kurang ({count}/{target_daily}). Memulai proses...")

    if not os.path.exists(target_file):
        raise FileNotFoundError(f"Target file tidak ditemukan: {target_file}")

    with open(target_file, "r", encoding="utf-8") as f:
        original = f.read()

    if len(original) < 5:
        raise ValueError(f"Isi file {target_file} terlalu pendek untuk dimodifikasi.")

    modified = original[:-1]

    try:
        # Commit 1: Hapus 1 karakter
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(modified)
        run_git(["add", target_file])
        run_git(["commit", "-m", "docs: sync readme structure references"])
        run_git(["push", "origin", f"HEAD:{branch}"])
        print("[✓] Commit 1 berhasil di-push (+1 kontribusi)")

        time.sleep(3)

        # Commit 2: Kembalikan karakter semula
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(original)
        run_git(["add", target_file])
        run_git(["commit", "-m", "docs: finalize readme format consistency"])
        run_git(["push", "origin", f"HEAD:{branch}"])
        print("[✓] Commit 2 berhasil di-push (+1 kontribusi)")
        print("[✓] SUKSES! File kembali 100% utuh.")
    except Exception as e:
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(original)
        raise e


if __name__ == "__main__":
    main()
