export interface ProfilePictureUploadProps {
  profilePicture: string | null
  onPhotoChange?: (imageUrl: string) => void
}

export interface UserCompanyProfile {
  companyName?: string
  companyDomain: string | null
  clientCode?: string
  createdAt?: string
  id?: string
}

export interface IUserProfile {
  message: string
  data: {
    id: string
    firstName: string
    lastName: string
    email: string
    profilePicture?: string
    createdAt: string
    userRoles: Array<{
      role: {
        name: string
      }
    }>
    Clients: UserCompanyProfile[]
  }
}

export interface PersonnelProfileSectionProps {
  data: IUserProfile | undefined
}

export interface PersonnelCompanySectionProps {
  data: UserCompanyProfile | undefined
}
