import Event from '../models/Event.js'
import { crudRouter } from './crud.js'

// Public list + admin create/update/delete. `image` is a base64 data URL.
export default crudRouter(Event, {
  fields: ['title', 'date', 'location', 'description', 'image'],
})
