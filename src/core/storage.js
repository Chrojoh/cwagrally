export function downloadJson(course) {
  const blob = new Blob([JSON.stringify(course, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${course.organizationId}-${course.levelId}-${course.courseId.slice(-8)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function readCourseFile(file) {
  const data = JSON.parse(await file.text());
  if (!data || data.schemaVersion !== 3 || !Array.isArray(data.nodes)) {
    throw new Error('This is not a Rally Course Designer V3 course file.');
  }
  return data;
}
