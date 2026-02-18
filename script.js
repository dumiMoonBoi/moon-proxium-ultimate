const ripBtn = document.getElementById('ripBtn');
const urlInput = document.getElementById('urlInput');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const qualityList = document.getElementById('qualityList');

ripBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
    statusEl.textContent = "That's not a YouTube link, fam.";
    return;
  }

  statusEl.textContent = "Moon is scanning the void...";
  resultEl.classList.add('hidden');
  qualityList.innerHTML = '';

  try {
    // Using a public (and often abused) YouTube converter endpoint in 2026
    // This one still works for many people right now — can swap if it dies
    const apiUrl = `https://www.yt1s.com/api/ajaxSearch/index`;
    const params = new URLSearchParams();
    params.append('q', url);

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    const data = await res.json();

    if (data.status !== 'ok' || !data.vid || !data.links?.mp4) {
      throw new Error(data.msg || "API said no");
    }

    statusEl.textContent = "Video located. Choose your poison:";
    resultEl.classList.remove('hidden');

    const formats = data.links.mp4;
    Object.keys(formats).forEach(key => {
      const fmt = formats[key];
      if (fmt && fmt.k && fmt.size) {
        const btn = document.createElement('button');
        btn.className = 'quality-btn';
        btn.textContent = `${fmt.q} (${fmt.size})`;
        btn.onclick = () => downloadVideo(data.vid, key, fmt.k);
        qualityList.appendChild(btn);
      }
    });

  } catch (err) {
    statusEl.textContent = `Void rejected us: ${err.message || 'unknown error'}`;
  }
});

async function downloadVideo(vid, k, convertKey) {
  statusEl.textContent = "Converting in the shadows...";

  try {
    const convertRes = await fetch('https://www.yt1s.com/api/ajaxConvert/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ vid, k, convertKey })
    });

    const convertData = await convertRes.json();

    if (convertData.status !== 'ok' || !convertData.dlink) {
      throw new Error(convertData.msg || "Conversion failed");
    }

    statusEl.textContent = "Link secured. Downloading...";
    window.location.href = convertData.dlink;

  } catch (err) {
    statusEl.textContent = `Download crashed: ${err.message}`;
  }
}
