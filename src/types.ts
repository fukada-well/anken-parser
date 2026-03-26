export type Project = {
  id: number;
  projectName: string | null;
  description: string | null;
  techStack: string[];
  experience: string | null;
  rate: string | null;
  rateMin: number | null;
  duration: string | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  archived: boolean;
};

export type FilterState = {
  location: string;
  rateMin: number;
  techStack: string;
  keyword: string;
  sortBy: "createdAt" | "rateMin";
  sortOrder: "desc" | "asc";
};
