import Video from '../models/Video.js'
import { blogRouter } from './blogRouter.js'

// Videos API — see blogRouter for the shared behaviour. The media lives in
// Cloudinary; only URLs + metadata are stored here.
export default blogRouter(Video, {
  label: 'video',
  stringFields: ['description', 'videoUrl', 'publicId', 'thumbnailUrl', 'mimeType'],
  numberFields: ['duration', 'fileSize'],
  searchFields: ['title', 'description'],
})
