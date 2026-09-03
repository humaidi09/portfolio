import Experience from '../models/Experience.js'
import { crudRouter } from './crud.js'

// Experiences API — public list, admin create/update/delete.
export default crudRouter(Experience, {
  fields: ['role', 'organization', 'period'],
  arrayFields: ['skills'],
})
