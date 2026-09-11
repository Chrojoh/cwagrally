import assert from 'node:assert/strict';
import pack from '../src/orgs/cwags-2021.js';
import {generateCourse} from '../src/core/generator.js';
import {validateCourse} from '../src/core/validator.js';
let seed=42;
Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(const [width,height] of [[40,45],[45,40]]) {
  for(const routeStyle of ['classic','surprise','flowing','geometric','spiral','diagonal']) {
    for(let i=0;i<3;i++) {
      const course=generateCourse({pack,levelId:'S',ring:{width,height},routeStyle,includeSequences:i%2===0});
      const results=validateCourse(course,pack);
      assert.ok(!results.some(r=>!r.ok&&r.severity==='error'),JSON.stringify(results.filter(r=>!r.ok)));
      assert.equal(course.nodes.filter(n=>n.kind==='station').length,17);
      assert.ok(results.find(r=>r.code==='ordinary-spacing').ok);
    }
    console.log(`${width}x${height} Starter ${routeStyle}: 3 valid courses PASS`);
  }
}
assert.throws(()=>generateCourse({pack,levelId:'S',ring:{width:40,height:44}}),/Ring does not meet/);
