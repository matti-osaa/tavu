/* Tavu – registry for content packs.
   Every world (language / writing system) and every season lives in its own file under
   js/worlds/ and js/seasons/ and registers itself here. The game never hard-codes them,
   so adding a language = adding one file + one <script> line in index.html. */
const WORLDS = [];   // in map order (order of the <script> tags)
const SEASONS = [];

const Tavu = {
  /* A world pack:
     id, name (map title), script (subtitle), lang (BCP-47)
     map        letter → Latin answer (empty for Latin-script languages)
     levels     letter levels, each a string of new letters (may be empty)
     words      word levels: [[word, Finnish meaning], …][]
     latin      true when the language already uses Latin letters: then the ammo is the Finnish word
     toLatin    optional (word) → Latin form; default is letter by letter through `map`
     card       {color, bg}       map card colours
     palette    {sky:[top,bottom], path, edge, grass, grass2, hill, far}
     scenery(x, y, u, seed, deco)  draws one roadside object (blocks via cube())
     ambient()  optional extra layer drawn over the ground (falling petals …) */
  addWorld(w){ WORLDS.push(w); },

  /* A season pack:
     id, name, active(date) → boolean   when it switches on automatically
     palette    same shape as a world palette, overrides it
     colors     tyyppä body colours
     sky(sx, sy, ss)            replaces sun and clouds
     scenery(x, y, u, seed, deco) replaces the world's roadside objects
     accessory(cx, eyeY, u, near) drawn on every tyyppä (hat …)
     cssClass   body class for map/UI styling (css/seasons/<id>.css) */
  addSeason(s){ SEASONS.push(s); }
};

const $ = id => document.getElementById(id);
const CANDY = ['#FF4F8B','#FF9F1C','#FFC400','#7CCB3F','#3D9BE9','#9B6BFF','#16C2A3'];

/* Latin form of a word: the pack's own rule if it has one, otherwise letter by letter */
function toLatin(w, word){ return w.toLatin ? w.toLatin(word) : [...word].map(c => w.map[c] || '').join(''); }
