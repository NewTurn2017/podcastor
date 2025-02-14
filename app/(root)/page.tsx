'use client'
import PodcastCard from '@/components/PodcastCard'
import { podcastData } from '@/constants'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import React from 'react'

const Home = () => {
  const trendingPodcasts = useQuery(api.podcasts.getTrendingPodcasts)
  return (
    <div className='mt-9 flex flex-col gap-9 md:overflow-hidden'>
      <section className='flex flex-col gap-5'>
        <h1 className='text-20 font-bold text-white-1'>인기 팟캐스트</h1>
        <div className='podcast_grid'>
          {trendingPodcasts?.map(
            ({ _id, podcastTitle, podcastDescription, imageUrl }) => (
              <PodcastCard
                key={_id}
                title={podcastTitle}
                description={podcastDescription}
                imgUrl={imageUrl!}
                podcastId={_id}
              />
            )
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
