export function normalizeSkillName(skill: string) {
  return skill.trim().toLowerCase();
}

export function parseStoredSkills(
  skills: string | null | undefined
): string[] {
  if (!skills) {
    return [];
  }

  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function calculateSkillMatch(
  candidateSkills: string[],
  jobSkills: string[]
) {
  if (jobSkills.length === 0) {
    return 0;
  }

  const candidateSet = new Set(
    candidateSkills.map(normalizeSkillName)
  );

  const uniqueJobSkills = [
    ...new Set(jobSkills.map(normalizeSkillName)),
  ].filter(Boolean);

  if (uniqueJobSkills.length === 0) {
    return 0;
  }

  const matchedSkills = uniqueJobSkills.filter((skill) =>
    candidateSet.has(skill)
  ).length;

  return Math.round(
    (matchedSkills / uniqueJobSkills.length) * 100
  );
}

export function getMatchLabel(score: number) {
  if (score >= 80) {
    return "Strong match";
  }

  if (score >= 50) {
    return "Good match";
  }

  if (score > 0) {
    return "Partial match";
  }

  return "No skill match";
}
