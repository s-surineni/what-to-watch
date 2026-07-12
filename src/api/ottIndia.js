export async function fetchReleases(mediaType = 'movie') {
  const res = await fetch(`/api/ott-india?type=${mediaType}`)
  if (!res.ok) throw new Error(`OTT India error: ${res.status}`)
  const data = await res.json()
  return data.releases || []
}
