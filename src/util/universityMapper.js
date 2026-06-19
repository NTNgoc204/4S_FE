const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readProperty(source, camelCaseKey, pascalCaseKey) {
  return source?.[camelCaseKey] ?? source?.[pascalCaseKey];
}

function readText(source, camelCaseKey, pascalCaseKey) {
  const value = readProperty(source, camelCaseKey, pascalCaseKey);
  return typeof value === "string" ? value.trim() : "";
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function mapMajorNames(university) {
  const majors = asArray(
    readProperty(university, "suitableMajors", "SuitableMajors"),
  );

  return majors
    .map((major) => readText(major, "name", "Name"))
    .filter(Boolean)
    .join(", ");
}

export function isUniversityId(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function normalizeMatchScore(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const score = Number(value);
  return Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.round(score)))
    : null;
}

export function mapUniversityDetail(university) {
  if (!university) {
    return null;
  }

  const id = readText(university, "universityId", "UniversityId");
  const name = readText(university, "name", "Name");

  if (!id || !name) {
    return null;
  }

  const ranking = Number(readProperty(university, "ranking", "Ranking"));

  return {
    id,
    name,
    shortName: readText(university, "shortName", "ShortName"),
    location: readText(university, "location", "Location"),
    ranking: Number.isFinite(ranking) && ranking > 0 ? ranking : null,
    avatar: readText(university, "avatar", "Avatar") || null,
  };
}

export function mapUniversityRecommendation(university, tier) {
  const detail = mapUniversityDetail(university);

  if (!detail) {
    return null;
  }

  const majorNames = mapMajorNames(university);
  const matchPercent = normalizeMatchScore(
    readProperty(university, "matchPercentage", "MatchPercentage"),
  );

  return {
    ...detail,
    name: {
      vi: detail.name,
      en: detail.shortName || detail.name,
    },
    major: { vi: majorNames, en: majorNames },
    place: { vi: detail.location, en: detail.location },
    matchPercent,
    tier,
  };
}

export function mapUniversityRecommendations(data) {
  if (!data) {
    return [];
  }

  const topUniversities = asArray(
    readProperty(data, "top3Universities", "Top3Universities"),
  );
  const otherUniversities = asArray(
    readProperty(data, "next5Universities", "Next5Universities"),
  );

  return [
    ...topUniversities.map((university) =>
      mapUniversityRecommendation(university, "top3"),
    ),
    ...otherUniversities.map((university) =>
      mapUniversityRecommendation(university, "next5"),
    ),
  ].filter(Boolean);
}
