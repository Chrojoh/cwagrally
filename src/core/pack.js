export function stationNodeRange(level) {
  const offset = level?.stationCount?.includesStartFinish ? 2 : 0;
  return {
    min: Math.max(0, (level?.stationCount?.min ?? 0) - offset),
    max: Math.max(0, (level?.stationCount?.max ?? Infinity) - offset)
  };
}

export function officialStationCount(course, level) {
  const stations = course?.nodes?.filter(n => n.kind === 'station').length ?? 0;
  return stations + (level?.stationCount?.includesStartFinish ? 2 : 0);
}

export function stationCountLabel(level) {
  return level?.stationCount?.includesStartFinish
    ? 'stations including Start/Finish'
    : 'exercises excluding Start/Finish';
}

export function ringRuleIssues(level, ring) {
  const issues = [];
  const area = ring.width * ring.height;
  const areaRule = level?.ringArea || {};
  if (areaRule.min != null && area + 1e-6 < areaRule.min) {
    issues.push(`area ${area.toLocaleString()} sq ft is below ${areaRule.min.toLocaleString()} sq ft`);
  }
  if (Number.isFinite(areaRule.max) && area - 1e-6 > areaRule.max) {
    issues.push(`area ${area.toLocaleString()} sq ft is above ${areaRule.max.toLocaleString()} sq ft`);
  }
  const dims = level?.ringDimensions || {};
  if (dims.minWidth != null && ring.width + 1e-6 < dims.minWidth) {
    issues.push(`width ${ring.width} ft is below ${dims.minWidth} ft`);
  }
  if (dims.minHeight != null && ring.height + 1e-6 < dims.minHeight) {
    issues.push(`height ${ring.height} ft is below ${dims.minHeight} ft`);
  }
  if (dims.maxWidth != null && ring.width - 1e-6 > dims.maxWidth) {
    issues.push(`width ${ring.width} ft is above ${dims.maxWidth} ft`);
  }
  if (dims.maxHeight != null && ring.height - 1e-6 > dims.maxHeight) {
    issues.push(`height ${ring.height} ft is above ${dims.maxHeight} ft`);
  }
  return issues;
}

export function ringRuleText(level) {
  const parts = [];
  const area = level?.ringArea || {};
  if (area.min != null && Number.isFinite(area.max)) parts.push(`${area.min.toLocaleString()}–${area.max.toLocaleString()} sq ft`);
  else if (area.min != null) parts.push(`minimum ${area.min.toLocaleString()} sq ft`);
  const d = level?.ringDimensions || {};
  if (d.minWidth != null) parts.push(`minimum width ${d.minWidth} ft`);
  if (d.minHeight != null) parts.push(`minimum height ${d.minHeight} ft`);
  return parts.join(' · ') || 'organization default';
}

export function signImageUrl(pack, signId) {
  const sign = pack?.signs?.[signId];
  if (sign?.image) return sign.image;
  if (pack?.assetBase) return `${pack.assetBase}${signId}.png`;
  return '';
}

export function nextLevelsFor(level) {
  if (!level) return [];
  if (Array.isArray(level.nextLevels)) return [...level.nextLevels];
  return level.nextLevel ? [level.nextLevel] : [];
}

export function routeStylesFor(pack, level) {
  // Legacy routeStyles were implementation limits, not organization rules.
  const styles = level?.courseShapes || pack?.courseShapes || ['surprise','flowing','geometric','spiral','diagonal','classic'];
  return new Set(styles);
}
