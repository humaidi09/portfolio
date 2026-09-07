import Gallery from '../models/Gallery.js'
import { crudRouter } from './crud.js'

// `image` holds a Cloudinary https URL (or a legacy base64 data URL); the
// parallel `imagePublicId` is the Cloudinary handle we need to delete the asset.
export default crudRouter(Gallery, { fields: ['image', 'imagePublicId', 'caption'] })
