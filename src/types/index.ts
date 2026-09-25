export type SelectionStatus = 'PASSED' | 'FAILED' | 'PENDING';

export interface ApplicantResult {
  name: string;
  nim: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  division: string;
  ministry?: string;
  selection_stage: string;
  announcement_date: string;
  result_id: string;
  cabinet: string;
  selection_title: string;
  verification_url: string;
}

export interface VerificationData {
  verified: boolean;
  result_id: string;
  name: string;
  nim: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  division: string;
  ministry?: string;
  selection_title: string;
  cabinet: string;
  announcement_date: string;
  institution: string;
}

export interface AdminApplicant {
  id: string; // UUID
  nim: string;
  name: string;
  division: string;
  ministry?: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  selection_stage: string;
  announcement_date: string;
  result_id: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total: number;
  passed: number;
  failed: number;
  pending?: number;
}
