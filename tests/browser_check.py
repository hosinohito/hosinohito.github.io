"""Optional browser regression suite (Playwright, Chromium, BeautifulSoup)."""
from pathlib import Path
import json
import tempfile
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

SITE = Path(__file__).resolve().parents[1]
REPOS = [dict(id=100+i,name=name,html_url='https://github.com/hosinohito/'+name,fork=False,archived=False,owner={'login':'hosinohito'},pushed_at=f'2026-11-{14-i:02d}T08:00:00Z') for i,name in enumerate(['tanakacap','hoshiKabu','nekosama','imageMaterials'])]
def tweet(i, txt, name='tanakamitaina'):
    return dict(type='status',id=str(1234567890123456789+i),author={'screen_name':name},created_at=f'2026-11-{15-(i%2):02d}T04:00:00Z',text=txt)
TWEETS={'code':200,'results':[
    tweet(0,'tanakacapを更新しました。 https://github.com/hosinohito/tanakacap'),
    tweet(1,'今日はここを更新しました'),
    tweet(2,'すごい新作ですね https://booth.pm/ja/items/9137355'),
    tweet(3,'新作を公開しました https://booth.pm/ja/items/9137355','somebodyelse'),
    tweet(4,'新作を公開しました https://booth.pm/ja/items/9137355'),
]}
WEATHER={'current':{'temperature_2m':16.1,'weather_code':2,'time':'2026-11-15T05:00'}}
QUAKES=[{'code':551,'issue':{'time':'2026/11/15 03:00:00'},'earthquake':{'time':'2026/11/15 02:59:00','hypocenter':{'name':'東北地方の沖'},'maxScale':20}}]
PROFILE={'code':200,'user':{'avatar_url':'https://pbs.twimg.com/profile_images/1612399140432130050/uIvCOBA0_400x400.jpg'}}

soup=BeautifulSoup((SITE/'index.html').read_text('utf-8'),'html.parser')
for tag in list(soup.select('script,link[rel="stylesheet"],link[href^="https://fonts."]')): tag.decompose()
for img in soup.select('img[src^="https://"]'): img['src']=''
style=soup.new_tag('style')
style.string=(SITE/'style.css').read_text('utf-8')
soup.head.append(style)
fetch_stub=r'''
window.fetch = async function(url) {
  const u=String(url);
  let data;
  if(u.includes('api.github.com/')) data = __REPOS__;
  else if(u.includes('api.fxtwitter.com/') && u.includes('/statuses')) data = __TWEETS__;
  else if(u.includes('api.fxtwitter.com/')) data = __PROFILE__;
  else if(u.includes('api.open-meteo.com/')) data = __WEATHER__;
  else if(u.includes('api.p2pquake.net/')) data = __QUAKES__;
  else throw new Error('Mock not found: ' + u);
  return {ok:true,status:200,json:async()=>data};
};
'''
for key,obj in [('REPOS',REPOS),('TWEETS',TWEETS),('PROFILE',PROFILE),('WEATHER',WEATHER),('QUAKES',QUAKES)]:
    fetch_stub=fetch_stub.replace('__'+key+'__',json.dumps(obj,ensure_ascii=False))
setup=soup.new_tag('script')
setup.string=fetch_stub
soup.body.append(setup)
for path in ('data/content.js','data/twitter-snapshot.js','script.js','ui-sound.js'):
    tag=soup.new_tag('script')
    tag.string=(SITE/path).read_text('utf-8')
    soup.body.append(tag)
html=str(soup)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'],headless=True)
    errors=[]
    desktop=browser.new_page(viewport={'width':1370,'height':900})
    desktop.on('pageerror',lambda err:errors.append(str(err)))
    desktop.set_content(html,wait_until='domcontentloaded')
    desktop.wait_for_function('document.querySelectorAll(".work-entry").length === 12')
    desktop.wait_for_function('document.querySelectorAll(".tweet-entry").length >= 1')
    assert desktop.locator(".featured-entry").count()==2
    assert desktop.locator(".tweet-entry").count()>=1
    desktop.wait_for_function('document.querySelector("#weather-display").textContent.includes("16")')
    assert not errors,errors
    assert desktop.locator('.work-entry').count()==12
    # Stars cover the viewport; sparkle density increases on pointer movement.
    desktop.wait_for_function('document.querySelectorAll(".falling-star").length >= 8')
    assert desktop.locator('.falling-star').count() <= 32
    desktop.mouse.move(540, 225)
    desktop.wait_for_timeout(70)
    desktop.mouse.move(600, 235, steps=14)
    assert desktop.locator('.sparkle').count() >= 5, 'Cursor effect did not spawn a visible cluster'
    desktop.locator('#effect-button').click()
    assert desktop.locator('#effect-button').get_attribute('aria-pressed')=='false'
    assert desktop.locator('.falling-star').count()==0
    assert desktop.locator('.sparkle').count()==0
    desktop.wait_for_timeout(430)
    assert desktop.locator('.falling-star').count()==0, 'Stars continued after effects disabled'
    desktop.locator('#effect-button').click()
    assert desktop.locator('#effect-button').get_attribute('aria-pressed')=='true'
    desktop.wait_for_function('document.querySelectorAll(".falling-star").length >= 8')
    desktop.emulate_media(reduced_motion='reduce')
    desktop.wait_for_timeout(50)
    assert desktop.locator('.falling-star').count()==0, 'Reduced motion must disable starfall'
    desktop.emulate_media(reduced_motion='no-preference')
    desktop.wait_for_function('document.querySelectorAll(".falling-star").length >= 8')
    assert desktop.locator('#sound-button').count()==1
    assert desktop.locator('#sound-volume').count()==1
    desktop.locator('#sound-button').click()
    assert desktop.locator('#sound-button').get_attribute('aria-pressed')=='false'
    desktop.locator('#sound-button').click()
    assert desktop.locator('#sound-button').get_attribute('aria-pressed')=='true'
    assert desktop.locator('#twitter-feed').is_visible()
    desktop.locator('#twitter-embed-button').click()
    assert desktop.locator('#twitter-official').is_visible()
    desktop.locator('#twitter-feed-button').click()
    assert desktop.locator('#twitter-feed').is_visible()
    assert desktop.locator('.note-entry').count()==7
    assert desktop.locator('.recent-item').count()==5
    assert desktop.locator('.recent-item .source-twitter').count()<=1
    assert desktop.locator('.recent-item .source-github').count()>=1
    assert desktop.locator('.recent-item .source-booth').count()>=1
    assert '東北地方の沖' in desktop.locator('#quake-display').inner_text()
    assert desktop.locator('#jst-clock').inner_text()!='--:--'
    assert desktop.locator('#time-greeting').inner_text()!='いらっしゃいませ。'
    assert desktop.locator('.profile-emblem img').count()==1
    desktop.locator('[data-filter="booth"]').click()
    assert desktop.locator('.work-entry:visible').count()==6
    desktop.locator('#work-search').fill('桜')
    assert desktop.locator('.work-entry:visible').count()==1
    desktop.locator('#work-search').fill('ありえない作品名')
    assert desktop.locator('#no-results').is_visible()
    desktop.locator('#work-search').fill('')
    desktop.locator('[data-filter="all"]').click()
    assert desktop.locator('.work-entry:visible').count()==12
    samples=desktop.evaluate('''() => {
      const p=window.__siteChecks;
      const post=(id,user,text)=>({type:'status',id,author:{screen_name:user},created_at:'2026-11-15T04:00:00Z',text});
      const test=[
        post('1234567890123456789','tanakamitaina','新作を公開しました https://booth.pm/ja/items/9137355'),
        post('1234567890123456790','tanakamitaina','今日はここを更新しました'),
        post('1234567890123456791','someoneelse','新作を公開しました https://booth.pm/ja/items/9137355')
      ];
      const input=Array.from({length:10},(_,i)=>({id:'u'+i,source:i<8?'Twitter':'BOOTH',date:'2026-11-'+String(15-i).padStart(2,'0'),title:'item'+i,url:'https://twitter.com/tanakamitaina/status/'+(1000+i)}));
      return {yes:!!p.makeTwitterRecent(test[0],'tanakamitaina'),no1:p.makeTwitterRecent(test[1],'tanakamitaina')===null,no2:p.makeTwitterRecent(test[2],'tanakamitaina')===null,twitterCount:p.composeRecent(input).filter(row=>row.source==='Twitter').length};
    }''')
    assert samples=={'yes':True,'no1':True,'no2':True,'twitterCount':1},samples
    old=desktop.locator('html').get_attribute('data-tone')
    desktop.locator('#tone-button').click()
    assert desktop.locator('html').get_attribute('data-tone')!=old
    desktop.evaluate("document.documentElement.dataset.tone='lilac';")
    desktop.wait_for_timeout(1100)
    desktop.screenshot(path='/mnt/data/hoshinohito-v9-desktop.png')
    mobile=browser.new_page(viewport={'width':390,'height':844})
    mobile.on('pageerror',lambda err:errors.append(str(err)))
    mobile.set_content(html,wait_until='domcontentloaded')
    mobile.wait_for_function('document.querySelectorAll(".work-entry").length === 12')
    mobile.screenshot(path='/mnt/data/hoshinohito-v9-mobile.png',full_page=True)
    assert not mobile.evaluate('document.documentElement.scrollWidth > window.innerWidth + 3'),'Mobile horizontal overflow'
    # Offline / third-party outage: manual records and all works remain visible.
    offline_html=html.replace(fetch_stub, "window.fetch = async () => { throw new Error('offline test'); };")
    assert offline_html != html
    offline=browser.new_page(viewport={'width':900,'height':700})
    offline.on('pageerror',lambda err:errors.append(str(err)))
    offline.set_content(offline_html,wait_until='domcontentloaded')
    offline.wait_for_function('document.querySelector("#weather-display").textContent.includes("取得できません")')
    assert offline.locator('.recent-item').count()==5
    assert offline.locator('.featured-entry').count()==2
    assert offline.locator('.tweet-entry').count()>=1
    assert offline.locator('.work-entry').count()==12
    assert offline.locator('.note-entry').count()==7
    assert offline.locator('.recent-item .source-twitter').count()==0
    assert '取得できません' in offline.locator('#quake-display').inner_text()
    assert not errors,errors
    # Primary Open-Meteo request fails, second provider provides a dated forecast.
    oldline="else if(u.includes('api.open-meteo.com/')) data = " + json.dumps(WEATHER,ensure_ascii=False) + ';'
    assert oldline in fetch_stub,'Weather mock line missing; cannot verify Firefox fallback'
    backup_stub=fetch_stub.replace(oldline,"else if(u.includes('api.open-meteo.com/')) throw new Error('Firefox network test');\n  else if(u.includes('weather.tsukumijima.net/')) data = {forecasts:[{telop:'晴れ',temperature:{max:{celsius:'18'}}}],publicTime:'2026-11-15T05:00:00+09:00'};")
    fallback_html=html.replace(fetch_stub,backup_stub)
    assert fallback_html!=html
    backup=browser.new_page(viewport={'width':900,'height':700})
    backup.on('pageerror',lambda err:errors.append(str(err)))
    backup.set_content(fallback_html,wait_until='domcontentloaded')
    backup.wait_for_function('document.querySelector("#weather-display").textContent.includes("予報")')
    assert '18' in backup.locator('#weather-display').inner_text()
    assert '気象庁' in backup.locator('#weather-source').inner_text()
    assert not errors,errors
    browser.close()
    print('OK: browser mock, fall stars, sparkle density, ON/OFF, reduced-motion, fallback offline, recent limits, filters, search, weather, responsive')
