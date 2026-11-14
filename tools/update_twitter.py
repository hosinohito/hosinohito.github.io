#!/usr/bin/env python3
"""Refresh public Twitter snapshot from FxTwitter API, keeping old file on errors.

Runs locally or on GitHub Actions. stdlib only. Never stores API keys or cookies.
"""
from __future__ import annotations
import datetime as dt
import json
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / 'data' / 'content.js'
TARGET = ROOT / 'data' / 'twitter-snapshot.js'


def main() -> None:
    match = re.search(r'window\.SITE_DATA\s*=\s*(\{.*\})\s*;\s*$', CONTENT.read_text('utf-8'), re.S)
    if not match:
        raise RuntimeError('Cannot read content.js')
    cfg = json.loads(match.group(1))
    username = cfg['settings']['twitterHandle']
    if not re.fullmatch(r'[A-Za-z0-9_]{1,15}', username):
        raise RuntimeError('Invalid Twitter handle')
    url = f'https://api.fxtwitter.com/2/profile/{username}/statuses?count=30'
    request = urllib.request.Request(url, headers={'User-Agent': 'HoshinohitoPortfolio/1.0 (public-post snapshot)', 'Accept': 'application/json'})
    with urllib.request.urlopen(request, timeout=15) as response:
        raw = json.load(response)
    if raw.get('code') != 200 or not isinstance(raw.get('results'), list):
        raise RuntimeError('FxTwitter did not return a public timeline')

    posts = []
    for item in raw['results']:
        if not isinstance(item, dict) or item.get('type') != 'status':
            continue
        author = item.get('author') or {}
        if str(author.get('screen_name', '')).casefold() != username.casefold():
            continue
        if item.get('is_retweet') or item.get('retweeted_status'):
            continue
        tweet_id = str(item.get('id', ''))
        if not re.fullmatch(r'\d{14,22}', tweet_id):
            continue
        body = str(item.get('text') or '').strip()
        if not body:
            continue
        date = str(item.get('created_at') or '')[:16]
        data = {'id': tweet_id, 'text': body[:500], 'date': date}
        media = item.get('media') or {}
        if isinstance(media, dict):
            all_media = media.get('photos') or media.get('all') or []
            if isinstance(all_media, list):
                for m in all_media:
                    if isinstance(m, dict):
                        image = m.get('url') or m.get('media_url_https') or ''
                        if isinstance(image, str) and image.startswith('https://pbs.twimg.com/'):
                            data['media'] = [{'url': image}]
                            break
        posts.append(data)
        if len(posts) == 5:
            break
    if not posts:
        raise RuntimeError('No public posts were returned; preserving previous snapshot')
    now = dt.datetime.now(dt.timezone(dt.timedelta(hours=9))).isoformat(timespec='minutes')
    payload = {'fetchedAt': now, 'posts': posts}
    text = '/* Generated from public posts. Edit data/content.js for site-owned works. */\n' + 'window.TWITTER_SNAPSHOT = ' + json.dumps(payload, ensure_ascii=False, indent=2).replace('<', '\\u003c') + ';\n'
    TARGET.write_text(text, encoding='utf-8')
    print(f'Updated {TARGET}: {len(posts)} public posts')


if __name__ == '__main__':
    main()
