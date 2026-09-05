import Post from '../models/Post.js'
import { blogRouter } from './blogRouter.js'

// Posts API — see blogRouter for the shared behaviour. Reads are public
// (published only); create/update/delete require an admin token.
export default blogRouter(Post, {
  label: 'post',
  stringFields: ['subtitle', 'excerpt', 'content', 'coverImage'],
  searchFields: ['title', 'subtitle', 'excerpt', 'content'],
})
