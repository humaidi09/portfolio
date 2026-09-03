import Stat from '../models/Stat.js'
import { crudRouter } from './crud.js'

// Stats API — public list, admin create/update/delete.
export default crudRouter(Stat, {
  fields: ['label', 'value', 'suffix'],
})
