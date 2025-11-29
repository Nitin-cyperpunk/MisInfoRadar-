import { NextResponse } from 'next/server'
import { YouTubeClient } from '@/lib/apis/youtube-client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter: query' }, { status: 400 })
  }

  const youtubeClient = new YouTubeClient()

  try {
    const hashtags = await youtubeClient.fetchHashtags(query)
    return NextResponse.json({ query, hashtags })
  } catch (error) {
    console.error('YouTube hashtag API error:', error)
    return NextResponse.json({ error: 'Failed to fetch hashtags' }, { status: 500 })
  }
}


