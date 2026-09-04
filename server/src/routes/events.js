import Event from '../models/Event.js'
import { crudRouter } from './crud.js'

// Public list + admin create/update/delete. `images` is an array of base64
// data URLs (listFields so it's never split on the commas inside a data URL).
export default crudRouter(Event, {
  fields: ['title', 'date', 'location', 'description'],
  listFields: ['images'],
})
