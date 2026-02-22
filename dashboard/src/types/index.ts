export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  apiKey: string;
  allowedDomains: string[];
  webhookUrl: string | null;
  retentionDays: number;
  createdAt: string;
}

export interface Report {
  id: string;
  project: Pick<Project, 'id' | 'name'>;
  groupId: string | null;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assignedTo: Pick<User, 'id' | 'name'> | null;
  message: string;
  category: string;
  severity: string;
  reporterEmail: string | null;
  userContext: Record<string, unknown> | null;
  customMetadata: Record<string, unknown> | null;
  deviceInfo: Record<string, unknown> | null;
  pageUrl: string | null;
  timeline: TimelineEvent[] | null;
  consoleErrors: ConsoleError[] | null;
  networkFailures: NetworkFailure[] | null;
  consentGiven: boolean;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
}

export interface TimelineEvent {
  type: 'navigation' | 'click' | 'console_error' | 'network_failure';
  timestamp: number;
  [key: string]: unknown;
}

export interface ConsoleError {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
}

export interface NetworkFailure {
  url: string;
  method: string;
  status: number;
  duration: number;
  error?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface Comment {
  id: string;
  author: Pick<User, 'id' | 'name'>;
  content: string;
  createdAt: string;
}

export interface VersionInfo {
  current: string;
  latest: string | null;
  updateAvailable: boolean;
}

export interface SetupStatus {
  setupNeeded: boolean;
}

export interface AuthResponse {
  token: string;
}

export interface Snippet {
  npm: string;
  cdn: string;
}
