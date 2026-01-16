'use strict';

const byId = (id) => document.getElementById(id);
const BASE_URL = 'https://sh20raj.github.io/DrivePlyr/';
const PLAYER_PATHS = {
  sopplayer: 'sopplayer.html',
  plyr: 'plyr.html',
  fluid: 'fluid.html',
  afterglow: 'afterglow.html',
  mediaelements: 'mediaelements.html',
  vlitejs: 'vlitejs.html',
};
const EMBED_MESSAGE = 'Copy Embed Code';
let base = '';

const extractDriveId = (url) => {
  if (!url) {
    return null;
  }
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
};

const serializePayload = (payload) => {
  try {
    return btoa(JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to serialize payload', error);
    return null;
  }
};

const buildPayload = () => {
  const videoUrl = byId('videourl')?.value.trim();
  const id = extractDriveId(videoUrl);
  if (!id) {
    alert('Please enter a valid Google Drive URL.');
    return null;
  }

  const payload = { id };
  const poster = byId('posterurl')?.value.trim();
  const title = byId('videotitle')?.value.trim();

  if (poster) {
    payload.posterurl = poster;
  }
  if (title) {
    payload.videotitle = title;
  }

  return payload;
};

const updateIframes = (encoded) => {
  Object.entries(PLAYER_PATHS).forEach(([id, path]) => {
    const iframe = byId(id);
    if (iframe) {
      iframe.src = `${BASE_URL}${path}?id=${encoded}`;
    }
  });
};

const ensureBase = () => {
  if (!base) {
    alert('Please generate a link first using the GET button.');
    return false;
  }
  return true;
};

const openPlayer = (playerId) => {
  if (!ensureBase()) {
    return;
  }
  const path = PLAYER_PATHS[playerId];
  if (path) {
    window.open(`${BASE_URL}${path}?id=${base}`);
  }
};

const embedPlayer = (playerId) => {
  if (!ensureBase()) {
    return;
  }
  const path = PLAYER_PATHS[playerId];
  if (!path) {
    return;
  }
  const iframe = `<iframe width="560" height="315"\nscrolling="no"\nsrc="${BASE_URL}${path}?id=${base}"\nframeborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media;\ngyroscope; picture-in-picture" allowfullscreen>\n</iframe>`;
  prompt(EMBED_MESSAGE, iframe);
};

const getbase = () => {
  const payload = buildPayload();
  if (!payload) {
    return null;
  }
  const encoded = serializePayload(payload);
  if (!encoded) {
    alert('Unable to generate the player link. Please try again.');
    return null;
  }
  base = encoded;
  window.base = encoded;
  updateIframes(encoded);
  return encoded;
};

const get = () => getbase();

const opensp = () => openPlayer('sopplayer');
const openplyr = () => openPlayer('plyr');
const openfluid = () => openPlayer('fluid');
const openafterglow = () => openPlayer('afterglow');
const openmediaelements = () => openPlayer('mediaelements');
const openvlitejs = () => openPlayer('vlitejs');

const embedsp = () => embedPlayer('sopplayer');
const embedplyr = () => embedPlayer('plyr');
const embedfluid = () => embedPlayer('fluid');
const embedafterglow = () => embedPlayer('afterglow');
const embedmediaelements = () => embedPlayer('mediaelements');
const embedvlitejs = () => embedPlayer('vlitejs');

const iframe = () => updateIframes(base);
