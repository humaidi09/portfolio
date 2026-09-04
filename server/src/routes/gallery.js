import Gallery from '../models/Gallery.js'
import { crudRouter } from './crud.js'

export default crudRouter(Gallery, { fields: ['image', 'caption'] })
