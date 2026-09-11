import { rulePacks } from '../orgs/registry.js';
import { generateCourse } from './generator.js';
import { upgradeCourse } from './upgrade.js';

// Keep the bounded geometry/sign search off the UI thread. The long-lived
// worker also retains recent silhouettes between Generate clicks.
self.onmessage = ({data:{id,packId,options,operation}}) => {
  try {
    const pack=Object.values(rulePacks).find(p=>p.id===packId);
    if(!pack) throw Error(`Unknown organization ${packId}`);
    if(operation==='upgrade') self.postMessage({id,result:upgradeCourse(options.course,pack,options.target)});
    else self.postMessage({id,course:generateCourse({...options,pack})});
  } catch(error) {
    self.postMessage({id,error:error.message});
  }
};
