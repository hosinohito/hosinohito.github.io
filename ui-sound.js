/* Small synthesized interface sounds, isolated from content/network/UI logic.
 * No sound starts until a user gesture unlocks AudioContext. No audio files.
 */
(() => {
  'use strict';
  const button=document.getElementById('sound-button');
  const slider=document.getElementById('sound-volume');
  const get=key=>{try{return localStorage.getItem(key);}catch{return null;}};
  const set=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{}};
  let enabled=get('hoshinohito-sound-enabled')!=='off';
  let volume=Math.max(0,Math.min(100,Number(get('hoshinohito-sound-volume')??'30')||0));
  let context=null;
  let lastHover=0;
  let noteIndex=0;
  let unlocked=false;
  const notes=[659.25,739.99,783.99,880.00,987.77];
  const interactive='a, button, .work-entry, .featured-entry, .tweet-entry';

  function updateControls(){
    if(slider)slider.value=String(volume);
    if(button){
      button.setAttribute('aria-pressed',String(enabled));
      button.textContent=enabled?'♫ 音':'♩ 消音';
      button.title=enabled?'効果音をオフにする':'効果音をオンにする';
    }
  }
  updateControls();

  function unlock(){
    if(!enabled||unlocked)return;
    try{
      const Ctor=window.AudioContext||window.webkitAudioContext;
      if(!Ctor)return;
      context=context||new Ctor();
      if(context.state==='suspended')void context.resume().catch(()=>{});
      unlocked=true;
    }catch{context=null;}
  }

  function tone(frequency, delay, duration, strength=1){
    if(!enabled||!unlocked||!context||volume<=0)return;
    if(context.state!=='running')return;
    try{
      const now=context.currentTime+delay;
      const env=context.createGain();
      const max=Math.min(.06,.036*volume/100*strength);
      env.gain.setValueAtTime(.0001,now);
      env.gain.exponentialRampToValueAtTime(Math.max(.0002,max),now+.009);
      env.gain.exponentialRampToValueAtTime(.0001,now+duration);
      env.connect(context.destination);
      const base=context.createOscillator();
      base.type='sine';base.frequency.setValueAtTime(frequency,now);
      const overtone=context.createOscillator();
      overtone.type='triangle';overtone.frequency.setValueAtTime(frequency*2,now);
      const overtoneGain=context.createGain();overtoneGain.gain.value=.12;
      base.connect(env);overtone.connect(overtoneGain);overtoneGain.connect(env);
      base.start(now);overtone.start(now);
      base.stop(now+duration+.02);overtone.stop(now+duration+.02);
      base.addEventListener('ended',()=>{base.disconnect();overtone.disconnect();overtoneGain.disconnect();env.disconnect();},{once:true});
    }catch{ /* Audio is optional, including unsupported browser policies */ }
  }
  function hoverSound(){
    tone(notes[noteIndex++%notes.length],0,.085,.40);
  }
  function clickSound(){
    tone(587.33,0,.17,.85);
    tone(783.99,.065,.23,.65);
  }

  // React to real user gestures only. Hover sounds do not play on first load.
  document.addEventListener('pointerdown',event=>{
    unlock();
    if(event.button===0 && !event.target.closest('#sound-volume') && !event.target.closest('#sound-button'))clickSound();
  },{passive:true});
  document.addEventListener('keydown',event=>{
    if(!event.repeat && (event.key==='Enter'||event.key===' ') && event.target.closest('a,button')){
      unlock();clickSound();
    }
  });
  document.addEventListener('pointerover',event=>{
    if(event.pointerType==='touch'||!window.matchMedia?.('(hover: hover)').matches)return;
    const target=event.target.closest(interactive);
    if(!target||target.contains(event.relatedTarget))return;
    const now=performance.now();
    if(now-lastHover<135)return;
    lastHover=now;
    hoverSound();
  },{passive:true});

  button?.addEventListener('click',()=>{
    enabled=!enabled;
    set('hoshinohito-sound-enabled',enabled?'on':'off');
    if(enabled)unlock();
    updateControls();
    if(enabled)tone(659.25,0,.13,.55);
  });
  slider?.addEventListener('input',()=>{
    volume=Math.max(0,Math.min(100,Number(slider.value)||0));
    set('hoshinohito-sound-volume',volume);
    if(volume>0)unlock();
  });
})();
