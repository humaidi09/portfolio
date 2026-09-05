import Category from '../models/Category.js'
import { crudRouter } from './crud.js'

// Categories: public list + admin create/update/delete via the generic factory.
export default crudRouter(Category, { fields: ['name', 'slug', 'description'] })
