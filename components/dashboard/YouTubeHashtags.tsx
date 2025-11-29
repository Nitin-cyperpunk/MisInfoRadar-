'use client'

import { useEffect, useState } from 'react'

type YouTubeHashtag = {
  tag: string
  occurrences: number
  videoCount: number
}

type Props = {
  query?: string
}

export function YouTubeHashtags({ query = 'indian elections' }: Props) {
  const [hashtags, setHashtags] = useState<YouTubeHashtag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/youtube/hashtags?query=${encodeURIComponent(query)}`)
        if (!res.ok) {
          throw new Error('Failed to fetch YouTube hashtags')
        }

        const data = await res.json()
        setHashtags(data.hashtags || [])
      } catch (err: any) {
        console.error('Error loading YouTube hashtags:', err)
        setError(err?.message || 'Error loading YouTube hashtags')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [query])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse"
          >
            <div className="mb-2 h-5 w-32 rounded bg-white/10" />
            <div className="h-3 w-40 rounded bg-white/10" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-xs text-red-400">{error}</div>
  }

  if (!hashtags.length) {
    return (
      <div className="text-xs text-slate-400">
        No YouTube hashtags detected for this query yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {hashtags.map(hashtag => (
        <div
          key={hashtag.tag}
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-3"
        >
          <p className="text-sm font-semibold text-white">{hashtag.tag}</p>
          <p className="text-xs text-slate-300">
            {hashtag.occurrences} tag mentions across {hashtag.videoCount} videos
          </p>
        </div>
      ))}
    </div>
  )
}


