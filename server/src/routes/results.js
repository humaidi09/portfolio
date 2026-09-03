import Result from '../models/Result.js'
import { crudRouter } from './crud.js'

// Results API — public list, admin create/update/delete.
export default crudRouter(Result, {
  fields: ['term', 'gpa', 'scale', 'note'],
})
