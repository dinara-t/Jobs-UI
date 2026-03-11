export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type JobTemp = {
  id: number;
  firstName: string;
  lastName: string;
} | null;

export type Job = {
  id: number;
  name?: string;
  startDate?: string;
  endDate?: string;
  temp?: JobTemp;

  title?: string;
  description?: string;
  client?: string;
  location?: string;
  assignedTemp?: { id: number; firstName: string; lastName: string } | null;
};

export type JobPatch = {
  name?: string;
  startDate?: string;
  endDate?: string;
  tempId?: number | null;

  title?: string;
  description?: string;
  client?: string;
  location?: string;
  assignedTempId?: number | null;
};

export type Temp = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  managerId: number | null;
};

export type TempUpdate = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  managerId: number | null;
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
  managerId: number | null;
  jobs: JobSummary[];
};
