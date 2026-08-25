import type { Job } from "@/types/job";

export const recommendedJobs: Job[] = [
  {
    id: "job-1",
    title: "Frontend Developer",
    company: "Tech Company",
    skills: ["React", "Next.js", "TypeScript"],
    workType: "Remote",
    employmentType: "Full-time",
    matchScore: 94,
  },
  {
    id: "job-2",
    title: "React Developer",
    company: "Software Company",
    skills: ["React", "JavaScript", "CSS"],
    workType: "Hybrid",
    employmentType: "Full-time",
    matchScore: 91,
  },
  {
    id: "job-3",
    title: "UI Engineer",
    company: "Digital Company",
    skills: ["React", "UI/UX", "Tailwind"],
    workType: "Remote",
    employmentType: "Full-time",
    matchScore: 87,
  },
];