export interface SlackSettings {
  slackWebhookUrl: string
  newTickets: boolean
  ticketAssignments: boolean
  statusChanges: boolean
}

export interface ApiResponse<T> {
  message: string
  data: T
}

export type ClientData = {
  clientCode: string
  companyName: string
  companyDomain: string
}

export type SettingsState = {
  clientCode: string
  companyName: string
  companyDomain: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  emailNotifications: boolean
  slackNotifications: boolean
  profilePicture: string | null
  Clients?: ClientData[]
}
