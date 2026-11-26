/*
 * Site behavior. Text content is maintained in data/content.js.
 * DOM is rendered with textContent and trusted source URLs; remote API failures
 * never erase manually recorded entries.
 */
(() => {
  'use strict';

  const data = window.SITE_DATA;
  const settings = data?.settings || {};
  const works = Array.isArray(data?.works) ? data.works : [];
  const notes = Array.isArray(data?.notes) ? data.notes : [];
  const handWrittenRecent = Array.isArray(data?.recent) ? data.recent : [];
  const $ = selector => document.querySelector(selector);
  const byId = id => document.getElementById(id);
  const memoGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const memoSet = (key,value) => { try { localStorage.setItem(key,String(value)); } catch { /* blocked */ } };
  const text = value => String(value ?? '');
  const norm = value => text(value).normalize('NFKC').toLocaleLowerCase('ja');

  function node(tag, cssClass, content) {
    const n = document.createElement(tag);
    if(cssClass) n.className = cssClass;
    if(content !== undefined) n.textContent = text(content);
    return n;
  }
  function externalLink(url, label, className) {
    const anchor = node('a',className,label);
    anchor.href = isSafeExternalUrl(url) ? url : '#links';
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    return anchor;
  }
  function isSafeExternalUrl(url) {
    try { return new URL(url).protocol === 'https:'; } catch { return false; }
  }
  // Accept owned, local static image files too, for reliable manual updates.
  function isSafeImageUrl(url) {
    if(isSafeExternalUrl(url)) return true;
    return typeof url === 'string' && /^(?:\.\/)?assets\/(?!.*\.\.)[\w/.-]+\.(?:svg|png|jpe?g|webp)$/i.test(url);
  }
  function loadStatus(text) { const el = byId('recent-status'); if(el) el.textContent = text; }

  // WORKS: BOOTH images remain hot-linked; the decorative fallback remains visible
  // when the image provider blocks loading. Non-image entries use their symbol.
  function renderWorks() {
    const root = byId('works-grid');
    if(!root) return;
    const entries = works.map((work, index) => {
      const entry = node('article', 'work-entry');
      entry.dataset.group = work.group === 'booth' ? 'booth' : 'code';
      entry.dataset.search = [work.title,work.description,work.category,...(work.tags||[])].join(' ');
      const cover = externalLink(work.url, '', `work-cover cover-${index % 6} ${work.image ? 'work-cover-product' : 'work-cover-code'}`);
      cover.setAttribute('aria-label', `${text(work.title)} のページ`);
      cover.append(node('span','cover-fallback',work.symbol || '✧'));
      if (work.image && isSafeImageUrl(work.image)) {
        const img = node('img','cover-image');
        img.src = work.image;
        img.alt = `${text(work.title)}の商品画像`;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        img.addEventListener('error', () => img.classList.add('image-error'), {once:true});
        cover.append(img);
      }
      const star = node('span','cover-corner','✦');
      star.setAttribute('aria-hidden','true');
      cover.append(star);
      const info = node('div','work-info');
      const meta = node('div','entry-topline');
      meta.append(node('span','source-label',work.group === 'booth' ? 'BOOTH' : 'GitHub'));
      meta.append(node('span','',work.category));
      meta.append(node('span','entry-date',work.date));
      const h3 = node('h3');
      const nameLink = externalLink(work.url, work.title);
      const arrow = node('span','small-arrow',' ↗');
      arrow.setAttribute('aria-hidden','true');
      nameLink.append(arrow);
      h3.append(nameLink);
      info.append(meta,h3,node('p','',work.description));
      const tags = node('div','entry-tags');
      (work.tags||[]).forEach(tag => tags.append(node('span','',tag)));
      info.append(tags);
      entry.append(cover,info);
      return entry;
    });
    root.replaceChildren(...entries);
  }
  // FEATURED: names are IDs from data/content.js; changing featured works never
  // requires editing the layout. The same image URLs and link rules as the list.
  function renderFeaturedWorks(){
    const root=byId('featured-works');
    if(!root)return;
    const ids=Array.isArray(settings.featuredIds)?settings.featuredIds.slice(0,3):[];
    const cards=[];
    for(const id of ids){
      const work=works.find(entry=>entry.id===id);
      if(!work)continue;
      const link=externalLink(work.url,'','featured-entry');
      const media=node('div','featured-media');
      media.append(node('span','featured-symbol',work.symbol||'✧'));
      if(work.image && isSafeImageUrl(work.image)){
        const img=node('img','featured-photo');
        img.src=work.image;img.alt=`${text(work.title)} の画像`;
        img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
        img.addEventListener('error',()=>img.classList.add('image-error'),{once:true});
        media.append(img);
      }
      const copy=node('div','featured-copy');
      const label=node('span','featured-label',work.group==='booth'?'BOOTH / PICK UP':'GitHub / PICK UP');
      copy.append(label,node('strong','',work.title),node('p','',work.description));
      const tags=node('span','featured-tags',(work.tags||[]).slice(0,3).join(' · '));
      copy.append(tags);
      link.append(media,copy,node('span','featured-arrow','↗'));
      cards.push(link);
    }
    if(cards.length)root.replaceChildren(...cards);
    else root.replaceChildren();
  }
  function renderNotes(){
    const root = $('.notes-list');
    if(!root) return;
    const entries = notes.map((note,index) => {
      const link = externalLink(note.url,'','note-entry');
      link.append(node('span','note-index',String(index+1).padStart(2,'0')));
      link.append(node('span','note-topic',note.category));
      const body = node('span','note-body');
      body.append(node('strong','',note.title));
      body.append(node('small','',note.description));
      link.append(body);
      const arrow = node('span','note-link','↗');
      arrow.setAttribute('aria-hidden','true');
      link.append(arrow);
      return link;
    });
    root.replaceChildren(...entries);
  }
  renderWorks();
  renderFeaturedWorks();
  renderNotes();
  const allWorks = Array.from(document.querySelectorAll('.work-entry'));
  const filterButtons = Array.from(document.querySelectorAll('button[data-filter]'));
  const search = byId('work-search');
  let activeFilter = 'all';
  function updateWorks(){
    const q = norm(search?.value).trim();
    let shown = 0;
    for(const item of allWorks){
      const visible = (activeFilter === 'all' || item.dataset.group === activeFilter) && (!q || norm(item.dataset.search).includes(q));
      item.hidden = !visible;
      if(visible) shown++;
    }
    if(byId('results-count')) byId('results-count').textContent = String(shown);
    if(byId('no-results')) byId('no-results').hidden = shown > 0;
    for(const button of filterButtons){
      const num = button.querySelector('span');
      if(num){
        const f = button.dataset.filter;
        num.textContent = f === 'all' ? String(allWorks.length) : String(allWorks.filter(item => item.dataset.group === f).length);
      }
    }
  }
  filterButtons.forEach(button => button.addEventListener('click',() => {
    activeFilter = button.dataset.filter || 'all';
    filterButtons.forEach(item => {
      const on = item === button;
      item.classList.toggle('is-selected',on);
      item.setAttribute('aria-pressed',String(on));
    });
    updateWorks();
  }));
  search?.addEventListener('input', updateWorks);
  updateWorks();

  // RECENT WORK: only known, dated items are accepted. GitHub is a public API
  // overlay. Twitter is a very strict opt-in: author + published work link +
  // announcement/update text. Never fill five slots with unfiltered posts.
  const recentState = {github: [], twitter: []};
  function parseDate(value){
    const match = text(value).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if(!match) return NaN;
    const y = Number(match[1]), m = Number(match[2]), d = Number(match[3] || '1');
    if(m < 1 || m > 12 || d < 1 || d > 31) return NaN;
    return Date.UTC(y,m-1,d);
  }
  function prettyDate(entry){
    const match = text(entry.date).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if(!match) return '';
    return `${match[1]}.${match[2]}${match[3] ? '.'+match[3] : ''}`;
  }
  function normalizeRecent(row) {
    if(!row || typeof row !== 'object' || !Number.isFinite(parseDate(row.date)) || !isSafeExternalUrl(row.url) || !row.title || !row.source) return null;
    return {...row, source: row.source.toLowerCase() === 'twitter' ? 'Twitter' : row.source};
  }
  const defaultSourceLimits = {
    twitter: Math.max(0,Math.min(1,Number(settings.maxTwitterInRecent) || 0)),
    github: Math.max(0,Math.min(5,Number(settings.maxGithubInRecent) || 2)),
    booth: Math.max(0,Math.min(5,Number(settings.maxBoothInRecent) || 2)),
    note: Math.max(0,Math.min(5,Number(settings.maxNoteInRecent) || 2)),
  };
  function composeRecent(entries, max = Number(settings.recentCount) || 5) {
    const valid = entries.map(normalizeRecent).filter(Boolean);
    const seen = new Set();
    const unique = valid.filter(entry => {
      const key = entry.id || entry.url;
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Keep the confirmed listings first when API updates fall on the same day.
    unique.sort((a,b)=>parseDate(b.date)-parseDate(a.date));
    const chosen = [];
    const used = {};
    const cap = Math.max(1,Math.min(10,max));
    function add(entry){ chosen.push(entry); const source = entry.source.toLowerCase(); used[source]=(used[source]||0)+1; }
    for(const entry of unique){
      const source = entry.source.toLowerCase();
      if((used[source]||0) < (defaultSourceLimits[source] ?? 2)) add(entry);
      if(chosen.length >= cap) break;
    }
    if(chosen.length < cap){
      const already = new Set(chosen.map(row=>row.id || row.url));
      for(const entry of unique){
        const key = entry.id || entry.url;
        if(already.has(key) || (entry.source === 'Twitter' && (used.twitter||0)>=1)) continue;
        add(entry); already.add(key);
        if(chosen.length>=cap) break;
      }
    }
    return chosen.sort((a,b)=>parseDate(b.date)-parseDate(a.date));
  }
  function renderRecent(){
    const root = byId('recent-list');
    if(!root) return;
    const entries = composeRecent([...handWrittenRecent,...recentState.github,...recentState.twitter]);
    const lis = entries.map(item => {
      const li = node('li','recent-item');
      const time = node('time','',prettyDate(item));
      time.dateTime = item.date;
      const label = node('span','recent-item-content');
      label.append(node('small','source-tag source-'+item.source.toLowerCase(),item.source));
      label.append(externalLink(item.url,item.title));
      li.append(time,label);
      return li;
    });
    if(lis.length) root.replaceChildren(...lis);
    else root.replaceChildren(node('li','recent-pending','活動履歴はまだありません。'));
  }
  renderRecent();
  loadStatus('掲載履歴から表示中');

  function cachedJSON(key,ttl,withTimestamp=false){
    try{
      const value=JSON.parse(sessionStorage.getItem(key) || 'null');
      return value && Number.isFinite(value.savedAt) && value.savedAt<=Date.now() && Date.now()-value.savedAt<ttl ? (withTimestamp?value:value.data) : null;
    }catch{return null;}
  }
  function cacheJSON(key,data,savedAt){ try{sessionStorage.setItem(key,JSON.stringify({savedAt,data}));}catch{} }
  async function fetchJSON(url, key, minutes=20, timeoutMs=8000, withTimestamp=false){
    const hit = cachedJSON(key,minutes*60000,withTimestamp);
    if(hit!==null)return hit;
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const response = await fetch(url, {signal:controller.signal,cache:'no-cache',headers:{'Accept':'application/json'}});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const result = await response.json();
      const savedAt=Date.now();
      cacheJSON(key,result,savedAt);
      return withTimestamp?{data:result,savedAt}:result;
    } finally {clearTimeout(timeout);}
  }

  function toJstDateISO(value){
    const date = new Date(value);
    if(!Number.isFinite(date.getTime()))return '';
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{
      timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'
    }).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  async function updateGitHub(){
    const username = text(settings.githubUser||'hosinohito').replace(/[^\w-]/g,'');
    if(!username)return;
    try{
      const url = `https://api.github.com/users/${username}/repos?sort=pushed&direction=desc&per_page=60`;
      const repos = await fetchJSON(url,'github-repos-'+username,settings.refreshMinutes||20);
      if(!Array.isArray(repos)) return;
      const rows = repos.filter(repo => repo && !repo.fork && !repo.archived && repo.owner?.login?.toLowerCase() === username.toLowerCase())
        .map(repo => ({
          id: 'github-repo-' + repo.id,
          date: toJstDateISO(repo.pushed_at),
          source:'GitHub',
          title: `${repo.name} を更新`,
          url:repo.html_url,
        }))
        .filter(normalizeRecent);
      recentState.github=rows;
      renderRecent();
      loadStatus('掲載履歴 + GitHub公開情報');
    } catch {
      loadStatus('掲載履歴を表示中（外部更新は未取得）');
    }
  }

  function extractPostLinks(post){
    const texts = [text(post.text),text(post.raw_text?.text)];
    for(const facet of post.raw_text?.facets||[]){
      texts.push(text(facet.replacement),text(facet.original));
    }
    for(const ref of post.entities?.urls||[]){
      texts.push(text(ref.expanded_url),text(ref.url));
    }
    return texts.join(' ');
  }
  function getProductionTarget(post){
    const haystack = extractPostLinks(post);
    // Domains must identify a work belonging to this site, not an arbitrary
    // post about somebody else's projects. Reposts/replies are excluded below.
    const targets = [
      {regex:/https?:\/\/(?:www\.)?booth\.pm\/ja\/items\/(\d+)/gi,prefix:'booth:'},
      {regex:/https?:\/\/(?:www\.)?github\.com\/hosinohito\/([\w.-]+)/gi,prefix:'github:'},
      {regex:/https?:\/\/(?:www\.)?note\.com\/tanakamitaina\/n\/([\w]+)/gi,prefix:'note:'},
    ];
    for(const target of targets){
      const match = target.regex.exec(haystack);
      if(match) return {id:target.prefix+match[1].toLowerCase(),name:match[1]};
    }
    return null;
  }
  function makeTwitterRecent(post,expectedUser){
    if(post?.type !== 'status' || !/^\d+$/.test(text(post.id)))return null;
    if(post.reply_to || post.in_reply_to_status_id || post.retweeted_status || post.is_retweet)return null;
    if(norm(post.author?.screen_name) !== norm(expectedUser))return null;
    const plain = text(post.text).replace(/https?:\/\/\S+/g,'').trim();
    if(!plain || /^RT\s+@/i.test(plain) || /^@\w+/.test(plain))return null;
    if(!/(公開|配布|販売開始|販売しました|リリース|アップデート|更新しました|実装しました|作りました|制作しました|完成しました|追加しました|公開しました)/u.test(plain))return null;
    const target=getProductionTarget(post);
    if(!target)return null;
    const created = new Date(post.created_at || Number(post.created_timestamp)*1000);
    if(!Number.isFinite(created.getTime()))return null;
    const title = plain.replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').slice(0,42);
    if(title.length<5)return null;
    return {
      id:'twitter-target-'+target.id,
      date:toJstDateISO(created),
      source:'Twitter',
      title,
      url:`https://twitter.com/${expectedUser}/status/${post.id}`,
    };
  }
  async function updateTwitter(){
    if(!settings.enableFxTwitterRecent)return;
    const username=text(settings.twitterHandle||'tanakamitaina').replace(/[^\w]/g,'');
    if(!username)return;
    try{
      const url = `https://api.fxtwitter.com/2/profile/${username}/statuses?count=40`;
      const result=await fetchJSON(url,'fxtwitter-statuses-'+username,settings.refreshMinutes||20);
      if(result.code !== 200 || !Array.isArray(result.results))return;
      const dedup = new Map();
      for(const post of result.results){
        const item=makeTwitterRecent(post,username);
        if(item && (!dedup.has(item.id) || parseDate(item.date)>parseDate(dedup.get(item.id).date)))dedup.set(item.id,item);
      }
      recentState.twitter=[...dedup.values()].sort((a,b)=>parseDate(b.date)-parseDate(a.date));
      renderRecent();
    } catch { /* no guessing or timeline keyword matching on API failure */ }
  }
  void updateGitHub();
  void updateTwitter();

  // TWITTER: readable native cards are the default. Official embeds are
  // optional because Firefox tracking protection may block widgets.js.
  // This is independent from the strict Recent Work production-post filter.
  const twitterFeed=byId('twitter-feed');
  const twitterOfficial=byId('twitter-official');
  const twitterFeedButton=byId('twitter-feed-button');
  const twitterEmbedButton=byId('twitter-embed-button');
  const twitterStatus=byId('twitter-feed-status');
  const twitterUser=text(settings.twitterHandle||'tanakamitaina').replace(/[^\w]/g,'');
  const twitterProfile=`https://twitter.com/${twitterUser}`;
  const twitterSnapshot=window.TWITTER_SNAPSHOT||{};
  const twitterPosts=Array.isArray(twitterSnapshot.posts)?twitterSnapshot.posts:[];
  function normalizedTweet(post){
    if(!post||typeof post!=='object')return null;
    const body=text(post.text).replace(/\s+/g,' ').trim();
    if(!body)return null;
    const date=text(post.date||post.created_at).slice(0,16);
    const id=text(post.id);
    const url=/^\d{14,22}$/.test(id)?`${twitterProfile}/status/${id}`:
      (typeof post.url==='string'&&/^https:\/\/(?:www\.)?(?:x|twitter)\.com\/tanakamitaina(?:\/status\/\d+)?\/?$/.test(post.url)?post.url:twitterProfile);
    let image='';
    const media=post.media?.photos||post.media?.all||post.media||[];
    if(Array.isArray(media)){
      const first=media.find(x=>x && typeof (x.url||x.media_url_https)==='string' && /^https:\/\/pbs\.twimg\.com\//.test(x.url||x.media_url_https));
      if(first)image=first.url||first.media_url_https;
    }
    return {text:body.slice(0,500),url,date,image};
  }
  function renderTwitterFeed(posts,status){
    if(!twitterFeed)return;
    const cards=posts.map(normalizedTweet).filter(Boolean).slice(0,5).map(post=>{
      const article=node('article','tweet-entry');
      const head=node('div','tweet-head');
      head.append(node('strong','','田中 / @'+twitterUser));
      if(post.date)head.append(node('time','',post.date.replace('T',' ')));
      const body=node('p','',post.text);
      const footer=externalLink(post.url,'投稿を開く ↗','tweet-action');
      article.append(head,body);
      if(post.image){
        const img=node('img','tweet-image');img.src=post.image;img.alt='投稿の画像';
        img.loading='lazy';img.referrerPolicy='no-referrer';
        img.addEventListener('error',()=>img.remove(),{once:true});article.append(img);
      }
      article.append(footer);
      return article;
    });
    if(cards.length)twitterFeed.replaceChildren(...cards);
    else twitterFeed.replaceChildren(node('p','twitter-message','投稿を取得できません。Twitterのプロフィールからご覧ください。'));
    if(twitterStatus)twitterStatus.textContent=status;
  }
  renderTwitterFeed(twitterPosts, `保存済みの投稿抜粋 · ${text(twitterSnapshot.fetchedAt||'')}`);
  async function updateTwitterFeed(){
    if(!twitterUser)return;
    try{
      const json=await fetchJSON(`https://api.fxtwitter.com/2/profile/${twitterUser}/statuses?count=20`,
                                  `fxtwitter-statuses-${twitterUser}`,settings.refreshMinutes||20);
      if(json?.code!==200 || !Array.isArray(json?.results))throw new Error('Invalid FxTwitter feed');
      const posts=json.results.filter(post=>post?.type==='status' && /^\d+$/.test(text(post.id)) &&
        norm(post.author?.screen_name)===norm(twitterUser) && !post.is_retweet && !post.retweeted_status &&
        typeof post.text==='string' && post.text.trim());
      if(!posts.length)throw new Error('No public posts');
      renderTwitterFeed(posts.map(post=>({...post,date:post.created_at||''})), '最近の公開投稿 · FxTwitter');
    }catch{ /* Keep the editable/static snapshot already displayed. */ }
  }
  void updateTwitterFeed();

  function setTwitterMode(mode){
    const official=mode==='official';
    if(twitterFeed)twitterFeed.hidden=official;
    if(twitterOfficial)twitterOfficial.hidden=!official;
    twitterFeedButton?.classList.toggle('is-active',!official);
    twitterEmbedButton?.classList.toggle('is-active',official);
    twitterFeedButton?.setAttribute('aria-pressed',String(!official));
    twitterEmbedButton?.setAttribute('aria-pressed',String(official));
    if(!official||!twitterOfficial||twitterOfficial.dataset.loaded)return;
    twitterOfficial.dataset.loaded='yes';
    const tip=twitterOfficial.querySelector('.twitter-embed-tip');
    const widgets=document.createElement('script');
    widgets.src='https://platform.twitter.com/widgets.js';widgets.async=true;widgets.charset='utf-8';
    widgets.addEventListener('load',()=>{
      try{window.twttr?.widgets?.load(twitterOfficial);}catch{}
    },{once:true});
    widgets.addEventListener('error',()=>{if(tip)tip.textContent='公式埋め込みの読み込みがブロックされました。上の「投稿」で閲覧できます。';},{once:true});
    document.head.append(widgets);
    setTimeout(()=>{
      if(!twitterOfficial.querySelector('iframe')&&tip)tip.textContent='公式表示が利用できません。ブラウザの追跡防止設定が原因の場合があります。';
    },9000);
  }
  twitterFeedButton?.addEventListener('click',()=>setTwitterMode('feed'));
  twitterEmbedButton?.addEventListener('click',()=>setTwitterMode('official'));

  // JAPAN CLOCK + GREETINGS: everyday questions and a few words of thanks.
  // Greeting is stable for every 20-minute block, not a blinking ticker.
  const greetings = {
    night: [
      '夜遅くまでおつかれさまです。','まだ起きてましたか？',
      '夜更かし中ですか？','そろそろ眠くなってきましたか？'
    ],
    dawn: [
      'おはようございます。よく眠れましたか？','早起きですか？ それとも夜更かし？',
      '朝早くからおつかれさまです。','これからお休みの方は、おつかれさまでした。'
    ],
    morning: [
      'おはようございます。朝ごはんは食べましたか？','今日はどんな予定ですか？',
      'もうお出かけですか？','朝から来てくれてありがとうございます。'
    ],
    noon: [
      'お昼はもう食べましたか？','今日は何を食べますか？',
      '今はお昼休みですか？','午前中、おつかれさまでした。'
    ],
    afternoon: [
      'そろそろ一息入れませんか？','おやつは何にしますか？',
      '作業の合間ですか？ おつかれさまです。','午後はどう過ごしていますか？'
    ],
    evening: [
      '今日もおつかれさまです。','晩ごはんは何にしますか？',
      'このあとは、ゆっくりできそうですか？','今夜は何をして過ごしますか？'
    ],
    late: [
      '今日も一日おつかれさまでした。','今日はどんな一日でしたか？',
      '寝る前に見に来てくれたんですか？','今はのんびりできていますか？'
    ]
  };
  const jstClock=byId('jst-clock');
  const jstDay=byId('jst-day');
  const greeting=byId('time-greeting');
  let activeGreetingId='';
  function updateClock(){
    const now=new Date();
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{
      timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',
      second:'2-digit',weekday:'short',hourCycle:'h23'
    }).formatToParts(now).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
    const hh=Number(parts.hour),minute=Number(parts.minute);
    const stamp=`${parts.year}-${parts.month}-${parts.day}`;
    if(jstClock){jstClock.textContent=`${parts.hour}:${parts.minute}`;jstClock.dateTime=`${stamp}T${parts.hour}:${parts.minute}:00+09:00`;}
    if(jstDay)jstDay.textContent=`${parts.year}.${parts.month}.${parts.day}  ${parts.weekday}`;
    const range=hh<4?'night':hh<6?'dawn':hh<11?'morning':hh<14?'noon':hh<17?'afternoon':hh<21?'evening':'late';
    const bucket=Math.floor(minute/20);
    const id=`${stamp}-${hh}-${bucket}`;
    if(greeting && activeGreetingId!==id){
      const list=greetings[range];
      // Deterministic within one time slice: refreshing does not shuffle it.
      let hash=0;
      for(const char of id)hash=(hash*31+char.charCodeAt(0))|0;
      greeting.textContent=list[Math.abs(hash)%list.length];
      activeGreetingId=id;
    }
  }
  updateClock();
  window.setInterval(updateClock,30000);

  // WEATHER: current conditions only, with wttr.in as the alternate provider.
  // Current-weather caches are separate from the old daily-forecast cache.
  // No geolocation permission and no backend are needed.
  const citySelect=byId('weather-city');
  const weatherDisplay=byId('weather-display');
  const weatherSource=byId('weather-source');
  const cities=Array.isArray(settings.weatherCities)?settings.weatherCities:[];
  const weatherRefreshMinutes=Number.isFinite(settings.refreshMinutes) && settings.refreshMinutes>0 ? settings.refreshMinutes : 20;
  let weatherSequence=0;
  function readableWeather(code){
    if(code===0)return '快晴';
    if(code===1)return '晴れ';
    if(code===2)return '晴れ・雲あり';
    if(code===3)return '曇り';
    if([45,48].includes(code))return '霧';
    if([51,53,55,56,57].includes(code))return '霧雨';
    if([61,63,65,66,67,80,81,82].includes(code))return '雨';
    if([71,73,75,77,85,86].includes(code))return '雪';
    if([95,96,97,99].includes(code))return '雷雨';
    return '';
  }
  // wttr.in uses WorldWeatherOnline codes, not Open-Meteo's WMO codes.
  function readableWttrWeather(code){
    if(code===113)return '晴れ';
    if(code===116)return '晴れ間あり';
    if([119,122].includes(code))return '曇り';
    if(code===143)return 'もや';
    if([248,260].includes(code))return '霧';
    if([185,263,266,281,284].includes(code))return '霧雨';
    if([176,293,296,299,302,305,308,311,314,353,356,359].includes(code))return '雨';
    if([179,323,326,329,332,335,338,368,371].includes(code))return '雪';
    if([182,317,320,350,362,365,374,377].includes(code))return '凍雨';
    if([227,230].includes(code))return '吹雪';
    if(code===200)return '雷';
    if([386,389].includes(code))return '雷雨';
    if([392,395].includes(code))return '雷を伴う雪';
    return '';
  }
  function setWeather(message,source,title=''){
    if(weatherDisplay){weatherDisplay.textContent=message;weatherDisplay.title=title;}
    if(weatherSource)weatherSource.textContent=source;
  }
  function weatherCacheKey(city){return 'hoshinohito-weather-current-v1-'+city.id;}
  function saveWeather(city,message,source,title,at){
    memoSet(weatherCacheKey(city),JSON.stringify({kind:'current',at,message,source,title}));
  }
  function previousWeather(city){
    try{
      const old=JSON.parse(memoGet(weatherCacheKey(city))||'null');
      if(old?.kind!=='current' || !Number.isFinite(old.at) || old.at>Date.now() || Date.now()-old.at>6*60*60*1000 || typeof old.message!=='string')return false;
      const at=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(old.at));
      setWeather('前回 '+old.message,`前回取得 ${at}（通信失敗）`,old.title||'');
      return true;
    }catch{return false;}
  }
  async function updateWeather(city,forceRefresh=false){
    if(!weatherDisplay || !city)return;
    const seq=++weatherSequence;
    setWeather('取得中…','天気を確認中');
    try{
      const params=new URLSearchParams({latitude:String(city.latitude),longitude:String(city.longitude),current:'temperature_2m,weather_code',temperature_unit:'celsius',timezone:'Asia/Tokyo'});
      const current=await fetchJSON(`https://api.open-meteo.com/v1/forecast?${params}`,'weather-openmeteo-current-v1-'+city.id,forceRefresh?0:weatherRefreshMinutes,5000,true);
      const w=current?.data?.current;
      const condition=readableWeather(w?.weather_code);
      if(!Number.isFinite(w?.temperature_2m) || !condition)throw new Error('Invalid Open-Meteo result');
      if(seq!==weatherSequence)return;
      const message=`${condition}  ${Math.round(w.temperature_2m*10)/10}°C`;
      const title=`${city.name} / ${text(w.time).replace('T',' ')} の推定現在天気`;
      const time=text(w.time).match(/T(\d{2}:\d{2})/)?.[1];
      setWeather(message,`${time?time+'時点':'現在'}（推定） / Open-Meteo`,title);
      saveWeather(city,message,'Open-Meteo',title,current.savedAt);
      return;
    }catch { /* Firefox/network/CDN failures: fall through to different host */ }
    if(seq!==weatherSequence)return;
    try{
      const fallback=await fetchJSON(`https://wttr.in/${city.latitude},${city.longitude}?format=j1`,'weather-wttr-current-v1-'+city.id,forceRefresh?0:weatherRefreshMinutes,5500,true);
      const w=fallback?.data?.current_condition?.[0];
      const temperature=text(w?.temp_C).trim();
      const condition=readableWttrWeather(Number(w?.weatherCode));
      if(!/^[-+]?\d+(?:\.\d+)?$/.test(temperature) || !Number.isFinite(Number(temperature)) || !condition)throw new Error('Invalid wttr.in current weather');
      if(seq!==weatherSequence)return;
      const message=`${condition}  ${Math.round(Number(temperature)*10)/10}°C`;
      // Preserve the provider's time as supplied; do not invent a date or zone.
      const observed=text(w.localObsDateTime || w.observation_time).trim();
      const title=`${city.name} / wttr.in${observed?' / 観測 '+observed:''}`;
      setWeather(message,'現在の天気 / wttr.in',title);
      saveWeather(city,message,'wttr.in',title,fallback.savedAt);
      return;
    }catch { /* both providers unavailable */ }
    if(seq!==weatherSequence)return;
    if(!previousWeather(city))setWeather('取得できません','気象庁のリンクで確認できます');
  }
  if(citySelect){
    for(const city of cities){
      const option=node('option','',city.name);
      option.value=city.id;
      citySelect.append(option);
    }
    function restoreWeatherCity(){
      const saved=memoGet('hoshinohito-weather-city');
      const city=cities.find(city=>city.id===saved) || cities.find(city=>city.id===settings.weatherDefault) || cities[0];
      citySelect.value=city?.id || '';
    }
    function refreshSelectedWeather(forceRefresh=false){
      void updateWeather(cities.find(city=>city.id===citySelect.value),forceRefresh);
    }
    restoreWeatherCity();
    citySelect.addEventListener('change',()=>{
      memoSet('hoshinohito-weather-city',citySelect.value);
      refreshSelectedWeather();
    });
    refreshSelectedWeather();
    window.setInterval(()=>{if(!document.hidden)refreshSelectedWeather(true);},weatherRefreshMinutes*60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSelectedWeather();});
    window.addEventListener('pageshow',event=>{
      if(event.persisted){restoreWeatherCity();refreshSelectedWeather();}
    });
  }

  // QUAKE: latest published quake information (NOT early-warning, NOT official
  // emergency push). Put the JMA link next to the panel for emergency checks.
  const scales={0:'0',10:'1',20:'2',30:'3',40:'4',45:'5弱',50:'5強',55:'6弱',60:'6強',70:'7'};
  async function updateQuakes(){
    const msg=byId('quake-display');
    const last=byId('quake-time');
    if(!msg)return;
    try{
      let events;
      try{events=await fetchJSON('https://api.p2pquake.net/v2/jma/quake?limit=10','quakes-jma',15);}
      catch {events=await fetchJSON('https://api.p2pquake.net/v2/history?codes=551&limit=15','quakes-history',15);}
      const rows=Array.isArray(events)?events:(Array.isArray(events?.items)?events.items:[]);
      const item=rows.find(row=>row?.earthquake && row?.code===551) || rows.find(row=>row?.earthquake);
      if(!item)throw new Error('No quake data');
      const quake=item.earthquake;
      const name=quake.hypocenter?.name || '震源地不明';
      const scale=scales[quake.maxScale] ?? '不明';
      msg.textContent=`${name} / 最大震度 ${scale}`;
      if(last)last.textContent=`発生: ${text(quake.time || item.issue?.time || '').slice(0,16)}（発表情報）`;
    }catch{
      msg.textContent='地震情報を取得できません';
      if(last)last.textContent='最新情報は気象庁で確認してください';
    }
  }
  void updateQuakes();

  // Twitter profile photo: use the site owner's current avatar if FxTwitter
  // profile data can be read. Fallback remains the known previously linked URL.
  async function updateAvatar(){
    const el=$('.profile-emblem img');
    if(!el)return;
    const showFallback=()=>el.classList.add('image-error');
    el.addEventListener('error',showFallback);
    el.addEventListener('load',()=>el.classList.remove('image-error'));
    if(el.complete && el.naturalWidth===0)showFallback();
    if(isSafeImageUrl(settings.twitterAvatar))el.src=settings.twitterAvatar;
    const user=text(settings.twitterHandle||'tanakamitaina').replace(/[^\w]/g,'');
    if(!user)return;
    try{
      const profile=await fetchJSON(`https://api.fxtwitter.com/2/profile/${user}`,'fxtwitter-avatar-'+user,720);
      const url=profile?.user?.avatar_url;
      if(profile?.code===200 && typeof url==='string' && /^https:\/\/(?:pbs\.twimg\.com|abs\.twimg\.com)\//.test(url)) {el.classList.remove('image-error');el.src=url;}
    }catch{ /* keep manual icon URL */ }
  }
  void updateAvatar();

  // EXISTING VISUAL SETTINGS / CURSOR EFFECTS are intentionally left isolated
  // so content updates cannot accidentally change them.
  const tones=['lilac','moss','blue'];
  const themeButton=byId('tone-button');
  const savedTone=memoGet('hoshinohito-tone-v4');
  if(savedTone && tones.includes(savedTone))document.documentElement.dataset.tone=savedTone;
  const toneLabels={lilac:'ラベンダー',moss:'ミント',blue:'ブルーグレー'};
  function updateToneLabel(){
    if(themeButton)themeButton.title=`配色: ${toneLabels[document.documentElement.dataset.tone]||'ラベンダー'}（クリックで切り替え）`;
  }
  updateToneLabel();
  themeButton?.addEventListener('click',()=>{
    const current=document.documentElement.dataset.tone;
    const next=tones[(tones.indexOf(current)+1)%tones.length];
    document.documentElement.dataset.tone=next;
    memoSet('hoshinohito-tone-v4',next);
    updateToneLabel();
  });
  // Decorative effects. The same switch controls ambient falling stars,
  // cursor sparkles, and click ripples; none can capture clicks or focus.
  const effectLayer=byId('effects');
  const effectButton=byId('effect-button');
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const finePointer=window.matchMedia?.('(pointer: fine)');
  const savedEffect=memoGet('hoshinohito-effects-v4');
  let effectsEnabled=savedEffect===null?!reducedMotion?.matches:savedEffect==='on';
  let lastSparkleAt=0,particleCount=0,fallingCount=0;
  const MAX_SPARKLES=90;
  const MAX_FALLING=32;
  const starColors=['#c2a8dc','#a9cdd5','#e3bdce','#b9cbea','#d8c7ab','#dbd5eb'];

  function canAnimate(){return effectsEnabled&&!reducedMotion?.matches&&!document.hidden;}
  function updateEffectLabel(){
    effectButton?.setAttribute('aria-pressed',String(effectsEnabled));
    if(effectButton)effectButton.title=effectsEnabled?'星・カーソル装飾をオフにする':'星・カーソル装飾をオンにする';
  }
  function clearEffects(){
    effectLayer?.replaceChildren();
    particleCount=0;
    fallingCount=0;
  }
  updateEffectLabel();
  effectButton?.addEventListener('click',()=>{
    effectsEnabled=!effectsEnabled;
    memoSet('hoshinohito-effects-v4',effectsEnabled?'on':'off');
    updateEffectLabel();
    if(!effectsEnabled)clearEffects();
    else fillSky();
  });

  function addSparkle(x,y){
    if(!effectLayer||particleCount>=MAX_SPARKLES)return;
    const particle=node('i',Math.random()<.18?'sparkle round':'sparkle');
    const size=3+Math.random()*9;
    const dx=(Math.random()-.5)*46,dy=(Math.random()-.5)*45-5;
    const duration=.75+Math.random()*.34;
    particle.style.left=`${x}px`;
    particle.style.top=`${y}px`;
    particle.style.width=`${size}px`;
    particle.style.height=`${size}px`;
    particle.style.animationDuration=`${duration}s`;
    particle.style.setProperty('--dx',`${dx}px`);
    particle.style.setProperty('--dy',`${dy}px`);
    particle.style.setProperty('--spark-color',starColors[Math.floor(Math.random()*starColors.length)]);
    effectLayer.append(particle);
    particleCount++;
    const clean=()=>{
      if(!particle.isConnected)return;
      particle.remove();
      particleCount=Math.max(0,particleCount-1);
    };
    particle.addEventListener('animationend',clean,{once:true});
    setTimeout(clean,(duration+.2)*1000);
  }

  // Stars fall over the whole viewport, including as the page scrolls.
  // Only a small, bounded number of nodes are kept alive at any time.
  function addFallingStar(startPartway=false){
    if(!effectLayer||!canAnimate()||fallingCount>=MAX_FALLING)return;
    const dot=Math.random()<.22;
    const star=node('i',dot?'falling-star falling-star--dot':'falling-star');
    const duration=8+Math.random()*4.4;
    const size=dot?3+Math.random()*2.5:6+Math.random()*6.5;
    star.style.left=`${1+Math.random()*98}%`;
    star.style.setProperty('--fall-size',`${size}px`);
    star.style.setProperty('--fall-duration',`${duration}s`);
    star.style.setProperty('--fall-drift',`${(Math.random()-.5)*135}px`);
    star.style.setProperty('--fall-rotation',`${110+Math.random()*250}deg`);
    star.style.setProperty('--fall-opacity',`${.38+Math.random()*.26}`);
    star.style.setProperty('--fall-color',starColors[Math.floor(Math.random()*starColors.length)]);
    if(startPartway)star.style.animationDelay=`-${Math.random()*duration*.92}s`;
    effectLayer.append(star);
    fallingCount++;
    const clean=()=>{
      if(!star.isConnected)return;
      star.remove();
      fallingCount=Math.max(0,fallingCount-1);
    };
    star.addEventListener('animationend',clean,{once:true});
    setTimeout(clean,(duration+.3)*1000);
  }
  function fillSky(){
    if(!canAnimate())return;
    for(let i=fallingCount;i<24;i++)addFallingStar(true);
  }
  fillSky();
  setInterval(()=>{if(canAnimate())addFallingStar();},360);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      effectLayer?.querySelectorAll('.falling-star').forEach(star=>star.remove());
      fallingCount=0;
    }else fillSky();
  });
  reducedMotion?.addEventListener?.('change',()=>{
    if(reducedMotion.matches)clearEffects();
    else fillSky();
  });

  document.addEventListener('pointermove',event=>{
    if(!canAnimate()||!finePointer?.matches||event.pointerType==='touch')return;
    const now=performance.now();
    if(now-lastSparkleAt<24)return;
    lastSparkleAt=now;
    for(let i=0;i<3;i++)addSparkle(event.clientX+(Math.random()-.5)*21,event.clientY+(Math.random()-.5)*21);
    if(Math.random()<.7)addSparkle(event.clientX+(Math.random()-.5)*27,event.clientY+(Math.random()-.5)*27);
  },{passive:true});
  document.addEventListener('pointerdown',event=>{
    if(!canAnimate()||event.button!==0||!effectLayer)return;
    const ripple=node('i','click-ripple');
    ripple.style.left=`${event.clientX}px`;
    ripple.style.top=`${event.clientY}px`;
    effectLayer.append(ripple);
    ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
    setTimeout(()=>ripple.remove(),1000);
    if(finePointer?.matches){
      for(let i=0;i<9;i++){
        const angle=i*Math.PI*2/9+Math.random()*.16;
        const radius=13+Math.random()*19;
        addSparkle(event.clientX+Math.cos(angle)*radius,event.clientY+Math.sin(angle)*radius);
      }
    }
  },{passive:true});

  // Tests can call pure filters without triggering network fetches when the
  // page is opened in a mocked environment. It is never a user-visible API.
  window.__siteChecks={composeRecent,makeTwitterRecent,getProductionTarget};
})();
