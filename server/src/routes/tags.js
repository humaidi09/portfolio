import Tag from '../models/Tag.js'
import { crudRouter } from './crud.js'

// Tags: public list + admin create/update/delete via the generic factory.
export default crudRouter(Tag, { fields: ['name', 'slug'] })
