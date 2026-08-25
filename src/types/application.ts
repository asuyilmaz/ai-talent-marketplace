export type ApplicationStatus =
  | "Applied"
  | "Reviewing"
  | "Interview"
  | "Rejected"
  | "Offer";

export type Application = {
  id: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
};