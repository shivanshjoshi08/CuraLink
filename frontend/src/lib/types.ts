
export type UserRole = 'patient' | 'researcher';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarId: string;
  role: UserRole;
  specialty?: string; // For researchers
  conditions?: string[]; // For patients
};

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  summary: string;
  imageId: string;
  fullText: string;
};

export type Community = {
  id: string;
  name: string;
  description: string;
  creatorId: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  communityId: string;
  createdAt: string;
};

export type Reply = {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
};

export type Expert = User & { role: 'researcher' };

export type ClinicalTrial = {
  id: string;
  title: string;
  sponsor: string;
  phase: number;
  status: 'Recruiting' | 'Completed' | 'Active';
  description: string;
  imageId: string;
};
