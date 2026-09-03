import Certification from '../models/Certification.js'
import { crudRouter } from './crud.js'

// Certifications API — public list, admin create/update/delete.
export default crudRouter(Certification, {
  fields: ['title', 'issuer', 'date', 'credentialId'],
})
