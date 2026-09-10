export const SCHEMA_VERSION = 3;

export function makeId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
}

export function makeCourse({ pack, levelId, ring, nodes, auxiliary = [], noGoZones = [], parentCourseId = null, name = null }) {
  return {
    schemaVersion: SCHEMA_VERSION,
    courseId: makeId('course'),
    parentCourseId,
    organizationId: pack.id,
    rulePackVersion: pack.version,
    discipline: pack.discipline,
    levelId,
    name: name || `${pack.shortName} ${pack.levels[levelId].name}`,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    ring: { ...ring },
    nodes,
    auxiliary: [...auxiliary],
    noGoZones: (noGoZones || []).map(z => ({ ...z }))
  };
}

export function cloneCourse(course) {
  return structuredClone ? structuredClone(course) : JSON.parse(JSON.stringify(course));
}

export function touchCourse(course) {
  course.modifiedAt = new Date().toISOString();
  return course;
}

export function stationNodes(course) {
  return course.nodes.filter(n => n.kind === 'station');
}
