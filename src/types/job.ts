export type Job = {
  id: string;
  title: string;
  company: string;
  skills: string[];
  workType: "Remote" | "Hybrid" | "On-site";
  employmentType: "Full-time" | "Part-time" | "Contract";
  matchScore: number;
};