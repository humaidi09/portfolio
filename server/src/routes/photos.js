import Photo from '../models/Photo.js'
import { blogRouter } from './blogRouter.js'

// Photos API — see blogRouter for the shared behaviour. The image lives in
// Cloudinary; only the URL + dimensions + metadata are stored here.
export default blogRouter(Photo, {
  label: 'photo',
  stringFields: ['imageUrl', 'publicId', 'caption'],
  numberFields: ['width', 'height'],
  searchFields: ['title', 'caption'],
})
