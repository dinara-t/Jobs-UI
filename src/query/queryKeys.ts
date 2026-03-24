export type JobsQueryParams = {
  assigned?: boolean;
  sortBy: "date" | "name";
  sortDir: "asc" | "desc";
  page: number;
  size: number;
};

export type TempsQueryParams = {
  jobId?: number;
  sortBy: "id" | "name" | "jobCount";
  sortDir: "asc" | "desc";
  page: number;
  size: number;
};

export const queryKeys = {
  profile: ["profile"] as const,
  jobs: (params: JobsQueryParams) => ["jobs", params] as const,
  job: (id: number) => ["job", id] as const,
  temps: (params: TempsQueryParams) => ["temps", params] as const,
  temp: (id: number) => ["temp", id] as const,
  availableTemps: (jobId: number) => ["temps", "available", jobId] as const,
};
