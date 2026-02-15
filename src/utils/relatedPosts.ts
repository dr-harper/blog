interface PostData {
  title: string;
  slug: string;
  tags: string[];
  date: Date;
  description?: string;
  headerImage?: string;
}

interface ScoredPost {
  post: PostData;
  score: number;
}

export function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  allPosts: PostData[],
  limit = 3
): PostData[] {
  const currentTagSet = new Set(currentTags.map((t) => t.toLowerCase()));

  const scored: ScoredPost[] = allPosts
    .filter((p) => p.slug !== currentSlug)
    .map((post) => {
      const postTags = new Set(post.tags.map((t) => t.toLowerCase()));
      let score = 0;
      for (const tag of currentTagSet) {
        if (postTags.has(tag)) score++;
      }
      return { post, score };
    });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.post.date.valueOf() - a.post.date.valueOf();
  });

  return scored.slice(0, limit).map((s) => s.post);
}
