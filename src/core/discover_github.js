export async function discoverGithub(user = process.env.GITHUB_USER || "tariromasawi") {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "omnirestore-zero" };
  if (process.env.GITHUB_PAT) headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
  const items = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&page=${page}&type=owner&sort=updated`, { headers });
    if (!res.ok) { items.push({ platform: "github", name: `_api_page_${page}`, status: "UNAVAILABLE", reason: `${res.status}` }); break; }
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) break;
    for (const repo of data) {
      items.push({ platform: "github", name: repo.name, full_name: repo.full_name, url: repo.html_url, clone_url: repo.clone_url, language: repo.language, description: repo.description, default_branch: repo.default_branch, private: Boolean(repo.private), ownershipStatus: "OWNED_PUBLIC", status: "DISCOVERED", discoveredAt: new Date().toISOString() });
    }
    if (data.length < 100) break;
  }
  return items;
}
