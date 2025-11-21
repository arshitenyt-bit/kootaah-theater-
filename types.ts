export interface RegistrationData {
  directorName: string;
  playwrightName: string;
  directorPhone: string;
  playTitle: string;
  scriptFile: File | null;
  isDirectorPlaywright: boolean; // New field for logic
  authorPermissionFile: File | null;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  aiFeedback?: string;
}