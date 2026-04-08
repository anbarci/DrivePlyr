
function getparam(a,e){return e||(e=window.location.href),new URL(e).searchParams.get(a)}
let s=a=>document.getElementById(a);

function getIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

// Module-level variable; also exposed as window.base for backward compatibility
let _base = null;

let get=()=>{
  getbase();
}
let getbase=()=>{
  const urlInput = s('videourl');
  const urlValue = urlInput ? urlInput.value.trim() : '';
  if (!urlValue) {
    alert('Please enter a valid Google Drive URL.');
    return null;
  }
  const id = getIdFromUrl(urlValue);
  if (!id) {
    alert('Could not extract a valid Drive ID from the provided URL.');
    return null;
  }
  const ply = { id };
  const arr = JSON.stringify(Object.assign({}, ply));
  _base = btoa(arr);
  window.base = _base;
  iframe();
  return _base;
}

// Player page definitions
const PLAYERS = [
  { key: 'sopplayer',     page: 'sopplayer.html' },
  { key: 'plyr',          page: 'plyr.html' },
  { key: 'fluid',         page: 'fluid.html' },
  { key: 'afterglow',     page: 'afterglow.html' },
  { key: 'mediaelements', page: 'mediaelements.html' },
  { key: 'vlitejs',       page: 'vlitejs.html' },
];

// Factory: open player in a new window
function openPlayer(page) {
  if (!_base) { alert('Please generate a player link first by entering a Drive URL and clicking GET.'); return; }
  window.open(PLAYER_BASE_URL + page + '?id=' + _base);
}

// Factory: show embed code prompt
const pmsg = 'Copy Embed Code';
function embedPlayer(page) {
  if (!_base) { alert('Please generate a player link first by entering a Drive URL and clicking GET.'); return; }
  prompt(pmsg, `<iframe width="560" height="315" \nscrolling="no"\nsrc="${PLAYER_BASE_URL}${page}?id=${_base}" \nframeborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; \ngyroscope; picture-in-picture" allowfullscreen>\n</iframe>`);
}

// Player openers
let opensp           = () => openPlayer('sopplayer.html');
let openplyr         = () => openPlayer('plyr.html');
let openfluid        = () => openPlayer('fluid.html');
let openafterglow    = () => openPlayer('afterglow.html');
let openmediaelements= () => openPlayer('mediaelements.html');
let openvlitejs      = () => openPlayer('vlitejs.html');

// Player embedders
let embedsp           = () => embedPlayer('sopplayer.html');
let embedplyr         = () => embedPlayer('plyr.html');
let embedfluid        = () => embedPlayer('fluid.html');
let embedafterglow    = () => embedPlayer('afterglow.html');
let embedmediaelements= () => embedPlayer('mediaelements.html');
let embedvlitejs      = () => embedPlayer('vlitejs.html');

let iframe=()=>{
  PLAYERS.forEach(({ key, page }) => {
    const el = s(key);
    if (el) el.src = PLAYER_BASE_URL + page + '?id=' + _base;
  });
}

