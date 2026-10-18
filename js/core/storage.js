/* Progress and settings, kept in the player's own browser (localStorage). */
const SAVE_KEY = 'kotro-karkkijahti-v1';   // kept from the prototype so earlier stars are not lost
let save = {stars:{}, seen:{}};
try{ const s = JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); if(s && s.stars) save = s; }catch(e){}
const persist = () => { try{ localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }catch(e){} };
const seenSet = worldId => new Set(save.seen[worldId]||[]);
