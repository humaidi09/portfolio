import SkillGroup from '../models/SkillGroup.js'
import { crudRouter } from './crud.js'

// Skill groups: public list + admin create/update/delete via the generic
// factory. `items` is a comma-separated list in the admin form → string array.
export default crudRouter(SkillGroup, { fields: ['title'], arrayFields: ['items'] })
