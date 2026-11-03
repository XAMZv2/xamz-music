import { Innertube } from 'youtubei.js';

let yt;
const getYT = async () => (yt ??= await Innertube.create({ generate_session_locally: true }));

const CLIENTS = ['YTMUSIC', 'ANDROID', 'TV', 'WEB_EMBEDDED', 'IOS', 'MWEB'];

async function getAudioUrl(innertube, id) {
  const errors = [];
  for (const client of CLIENTS) {
    try {
      const info = await innertube.getBasicInfo(id, { client });
      const format = info.chooseFormat({ type: 'audio', quality: 'best' });
      const url = format.url ?? (await format.decipher(innertube.session.player));
      if (url) return url;
    } catch (e) {
      errors.push(client + ': ' + e.message);
    }
  }
  throw new Error(errors.join(' | '));
}

export default async (req) => {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return new Response('Parameter id wajib diisi', { status: 400 });

  try {
    const innertube = await getYT();
    const url = await getAudioUrl(innertube, id);

    const headers = {};
    const range = req.headers.get('range');
    if (range) headers.range = range;

    const upstream = await fetch(url, { headers });
    const out = new Headers();
    for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
      const v = upstream.headers.get(h);
      if (v) out.set(h, v);
    }
    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
};

export const config = { path: '/api/stream' };
