export interface Client {
  id: string;
  clientCode: string;
  companyName: string | null;
  companyDomain?: string | null;
}
export interface SettingsState {
  clientCode: string;
  companyName: string;
  companyDomain: string;
  fullName: string;
  email: string;
  emailNotifications: boolean;
  slackNotifications: boolean;
  profilePicture: string | null;
}

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  deletedAt?: string | null;
};

export interface ApiError {
  response?: {
    data?: {
      details?: { field: string; message: string }[];
      message?: string;
    };
  };
}