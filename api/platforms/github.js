const { classifyFreshness } = require('./utils');

const USER = 'TheSyart';

async function fetchGithubProfile(fetchImpl = fetch) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'person-homepage/2.0'
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const [profile, repos] = await Promise.all([
    fetchJson(`https://api.github.com/users/${USER}`, headers, fetchImpl),
    fetchJson(`https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`, headers, fetchImpl)
  ]);
  const originals = repos.filter((repo) => !repo.fork);
  const featuredRepos = [...originals]
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 2)
    .map((repo) => ({
      name: repo.name,
      description: repo.description || '',
      language: repo.language || '',
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      url: repo.html_url
    }));
  return {
    login: profile.login,
    name: profile.name || profile.login,
    avatar: profile.avatar_url,
    followers: profile.followers || 0,
    repos: profile.public_repos || originals.length,
    totalStars: originals.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0),
    joinedAt: profile.created_at,
    url: profile.html_url,
    featuredRepos,
    source: 'GitHub API',
    updatedAt: new Date().toISOString()
  };
}

async function fetchJson(url, headers, fetchImpl) {
  const response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  return response.json();
}

function publicGithub(entry) {
  return { ...entry, status: classifyFreshness(entry?.updatedAt, 15 * 60_000) };
}

module.exports = { fetchGithubProfile, publicGithub };
