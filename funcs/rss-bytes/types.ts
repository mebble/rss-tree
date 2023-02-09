export type Post = {
    slug: string,
    title: string,
    date: string,
    featuredImage: string,
}

export type BytesData = {
    buildId: string,
    featuredPost: Post,
    posts: Post[],
}
