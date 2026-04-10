export type LoginRequest = {
  username: string;
  password: string;
};

export type Temp = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  managerId?: number | null;
  jobCount?: number;
};

export type JobTemp = {
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
  temp?: JobTemp | null;
  assignedTemp?: JobTemp | null;
};

export type TempWithJobs = Temp & {
  jobs: Array<{
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  }>;
};

export type TempUpdate = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  managerId?: number | null;
};

export type JobPatch = {
  name?: string;
  startDate?: string;
  endDate?: string;
  tempId?: number | null;
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

export type ChatContext = {
  currentJobId?: number | null;
  lastSuggestedTempId?: number | null;
};

export type PendingAction =
  | {
      type: "assign_temp_to_job";
      jobId: number;
      tempId: number;
      title: string;
      message: string;
      confirmLabel?: string;
    }
  | {
      type: "unassign_temp_from_job";
      jobId: number;
      title: string;
      message: string;
      confirmLabel?: string;
    };

export type AssistantAction =
  | {
      type: "send_message";
      label: string;
      message: string;
    }
  | {
      type: "confirm_pending_action";
      label: string;
    };

export type ClarificationPrompt = {
  id: string;
  label: string;
  message: string;
};

export type ResolvedEntities = {
  jobId?: number | null;
  tempId?: number | null;
  usedCurrentJobContext?: boolean;
  usedLastSuggestedTempContext?: boolean;
};

export type ChatRequest = {
  message: string;
  context?: ChatContext;
};

export type ChatResponse = {
  reply?: string;
  pendingAction?: PendingAction;
  suggestedActions?: AssistantAction[];
  clarificationPrompts?: ClarificationPrompt[];
  resolvedEntities?: ResolvedEntities;
};