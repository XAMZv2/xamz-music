import { Innertube } from 'youtubei.js';

let yt; // dipakai ulang antar request selama function masih "hangat"
const getYT = async () => (yt ??= await Innertube.create({ generate_session_locally: true }));

export default async (req) => {
  const q = new URL(req.url).searchParams.get('q')?.trim();
  if (!q) return Response.json({ error: 'Parameter q wajib diisi' }, { status: 400 });

  try {
    const innertube = await getYT();
    const res = await innertube.music.search(q, { type: 'song' });
    const items = res.songs?.contents ?? res.contents?.flatMap((s) => s.contents ?? []) ?? [];

    const songs = items
      .filter((i) => i.id)
      .map((i) => ({
        id: i.id,
        title: i.title,
        artist: i.artists?.map((a) => a.name).join(', ') || i.author?.name || '',
        thumb: i.thumbnails?.at(-1)?.url || '',
        duration: i.duration?.text || '',
      }));

    return Response.json(songs);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const config = { path: '/api/search' };
