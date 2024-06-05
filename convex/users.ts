import { ConvexError, v } from 'convex/values'

import { internalMutation, query } from './_generated/server'

export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
      .unique()

    if (!user) {
      throw new ConvexError('User not found')
    }

    return user
  },
})

// 이 쿼리는 팟캐스트 수에 따라 상위 사용자를 가져오는 데 사용됩니다. 먼저 팟캐스트는 조회수에 따라 정렬되고, 그 다음 사용자는 총 팟캐스트 수에 따라 정렬됩니다. 따라서 가장 많은 팟캐스트를 가진 사용자가 상위에 위치하게 됩니다.
export const getTopUserByPodcastCount = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.db.query('users').collect()

    const userData = await Promise.all(
      user.map(async (u) => {
        const podcasts = await ctx.db
          .query('podcasts')
          .filter((q) => q.eq(q.field('authorId'), u.clerkId))
          .collect()

        const sortedPodcasts = podcasts.sort((a, b) => b.views - a.views)

        return {
          ...u,
          totalPodcasts: podcasts.length,
          podcast: sortedPodcasts.map((p) => ({
            podcastTitle: p.podcastTitle,
            podcastId: p._id,
          })),
        }
      })
    )

    return userData.sort((a, b) => b.totalPodcasts - a.totalPodcasts)
  },
})

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('users', {
      clerkId: args.clerkId,
      email: args.email,
      imageUrl: args.imageUrl,
      name: args.name,
    })
  },
})

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    imageUrl: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
      .unique()

    if (!user) {
      throw new ConvexError('User not found')
    }

    await ctx.db.patch(user._id, {
      imageUrl: args.imageUrl,
      email: args.email,
    })

    const podcast = await ctx.db
      .query('podcasts')
      .filter((q) => q.eq(q.field('authorId'), args.clerkId))
      .collect()

    await Promise.all(
      podcast.map(async (p) => {
        await ctx.db.patch(p._id, {
          authorImageUrl: args.imageUrl,
        })
      })
    )
  },
})

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
      .unique()

    if (!user) {
      throw new ConvexError('User not found')
    }

    await ctx.db.delete(user._id)
  },
})
