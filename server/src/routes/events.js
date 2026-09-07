import Event from '../models/Event.js'
import { crudRouter } from './crud.js'

// Public list + admin create/update/delete. `images` is an array of Cloudinary
// https URLs (or legacy base64 data URLs); `imagePublicIds` is the matching,
// index-aligned array of Cloudinary handles used to delete assets. Both are
// listFields so a value is never split on commas inside a URL/data URL.
export default crudRouter(Event, {
  fields: ['title', 'date', 'location', 'description'],
  listFields: ['images', 'imagePublicIds'],
})
