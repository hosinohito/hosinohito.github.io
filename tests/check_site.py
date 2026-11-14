"""No-dependency guardrails for editing the static site."""
from pathlib import Path
import json
import re
from html.parser import HTMLParser
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]

class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.scripts = []
        self.links = []
        self.tweet_embeds = 0
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if 'id' in d: self.ids.append(d['id'])
        if tag == 'script' and 'src' in d: self.scripts.append(d['src'])
        if tag == 'a' and 'href' in d: self.links.append(d['href'])
        if tag == 'a' and 'twitter-timeline' in d.get('class',''): self.tweet_embeds += 1

html = (ROOT / 'index.html').read_text('utf-8')
css = (ROOT / 'style.css').read_text('utf-8')
script = (ROOT / 'script.js').read_text('utf-8')
content = (ROOT / 'data/content.js').read_text('utf-8')
match = re.search(r'window\.SITE_DATA\s*=\s*(\{.*\})\s*;\s*$', content, re.S)
assert match, 'content.js not valid assignment'
data = json.loads(match.group(1))
parser = SiteParser(); parser.feed(html)

assert len(parser.ids) == len(set(parser.ids)), 'Duplicate HTML ids'
for item_id in ['works-grid','featured-works','recent-list','time-greeting','jst-clock','weather-display','weather-source','weather-city','quake-display','quake-time','effect-button','sound-button','sound-volume','twitter-feed','twitter-official','twitter-feed-button','twitter-embed-button']:
    assert item_id in parser.ids, f'Missing element #{item_id}'
assert parser.scripts[:4] == ['data/content.js','data/twitter-snapshot.js','script.js','ui-sound.js'], f'Wrong script order: {parser.scripts}'
assert 'https://platform.twitter.com/widgets.js' in script, 'Official embed must be lazy loaded'
assert parser.tweet_embeds == 1
assert 'X / Twitter' not in html, 'Brand label should be Twitter'
assert '訪問カウンター' not in html and 'visit-count' not in html
assert len(data['works']) >= 12
assert len(data['notes']) >= 7
assert len(data['recent']) >= 5
assert data['settings']['recentCount'] == 5
assert len(data['settings']['featuredIds']) >= 2
assert set(data['settings']['featuredIds']) <= {x['id'] for x in data['works']}
assert all('forecastCity' in city and re.fullmatch(r'\d{6}', city['forecastCity']) for city in data['settings']['weatherCities'])
assert data['settings']['maxTwitterInRecent'] <= 1
assert all('date' in x and 'source' in x and 'title' in x and 'url' in x for x in data['recent'])
assert all(re.fullmatch(r'\d{4}-\d{2}(?:-\d{2})?', x['date']) for x in data['recent'])
assert all(x['source'] != 'Twitter' or re.search(r'twitter\.com/[^/]+/status/\d+$', x['url']) for x in data['recent']), 'Twitter recent needs exact post URL'
work_ids = [x['id'] for x in data['works']]
recent_ids = [x['id'] for x in data['recent']]
assert len(work_ids) == len(set(work_ids))
assert len(recent_ids) == len(set(recent_ids))
assert sum(item['group']=='booth' and item.get('image','').startswith('https://booth.pximg.net/') for item in data['works']) >= 6
for group in ['works','notes','recent']:
    for record in data[group]:
        assert urlparse(record['url']).scheme == 'https', (group,record)
assert 'createElement' in script and 'maxTwitterInRecent' in script
assert 'weather.tsukumijima.net' in script and 'api.open-meteo.com' in script
assert (ROOT/'ui-sound.js').exists()
assert (ROOT/'data/twitter-snapshot.js').exists()
assert (ROOT/'tools/update_twitter.py').exists()
assert 'prefers-reduced-motion' in script
assert 'falling-star' in css and '@keyframes star-rain' in css, 'Missing page-wide falling stars'
assert 'MAX_FALLING=32' in script and 'MAX_SPARKLES=90' in script, 'Effect density guardrails changed'
assert 'if(!effectsEnabled)clearEffects();' in script, 'Effect OFF must remove both falling stars and sparkles'
assert '@media(max-width:730px)' in css
assert (ROOT/'assets'/'favicon.svg').exists()
assert (ROOT/'.nojekyll').exists()
print(f'OK: HTML / works={len(data["works"])} / notes={len(data["notes"])} / recent={len(data["recent"])} / sources / interaction guards')
