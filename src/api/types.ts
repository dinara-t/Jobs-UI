export type LoginRequest = {
  username: string;
  password: string;
};

export type TempSummary = {
  id: number;
  firstName: string;
  lastName: string;
};

export type Job = {
  id: number;
  name?: string;
  title?: string;
  startDate: string;
  endDate: string;
  temp?: TempSummary | null;
  assignedTemp?: TempSummary | null;
};

export type JobPatch = {
  name?: string;
  startDate?: string;
  endDate?: string;
  tempId?: number;
};

export type Temp = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  managerId?: number | null;
  jobCount?: number;
};

export type TempUpdate = {
  firstName: string;
  lastName: string;
  email: string;
  managerId?: number | null;
  password?: string;
};

export type JobSummary = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

export type TempWithJobs = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  managerId?: number | null;
  jobs: JobSummary[];
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};