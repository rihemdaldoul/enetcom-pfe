export type Role = 'student' | 'company' | 'admin'
export type ProjectStatus = 'open' | 'closed' | 'filled'
export type ProjectType = 'PFE' | 'PFA' | 'internship'
export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected'
export type ForumStatus = 'upcoming' | 'ongoing' | 'past'
export type ParticipationStatus = 'pending' | 'accepted' | 'rejected'

export type Profile = {
  id: string
  email: string
  role: Role
  full_name: string | null
  is_banned: boolean
  created_at: string
}

export type Company = {
  id: string
  profile_id: string
  company_name: string
  industry: string | null
  website: string | null
  location: string | null
  description: string | null
  logo_url: string | null
  is_verified: boolean
  created_at: string
}

export type Project = {
  id: string
  company_id: string
  title: string
  description: string
  requirements: string | null
  type: ProjectType
  status: ProjectStatus
  location: string | null
  is_remote: boolean
  duration: string | null
  stipend: string | null
  slots: number
  deadline: string | null
  tags: string[]
  created_at: string
  updated_at: string
  companies?: Company
}

export type Application = {
  id: string
  project_id: string
  student_id: string
  status: ApplicationStatus
  cover_letter: string | null
  cv_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  projects?: Project
  profiles?: Profile
}

export type CV = {
  id: string
  student_id: string
  title: string
  content: Record<string, unknown>
  pdf_url: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export type Forum = {
  id: string
  title: string
  description: string | null
  location: string
  event_date: string
  deadline: string | null
  status: ForumStatus
  created_by: string | null
  created_at: string
}

export type ForumParticipation = {
  id: string
  forum_id: string
  profile_id: string
  role: Role
  status: ParticipationStatus
  offer_url: string | null
  message: string | null
  created_at: string
  profiles?: Profile
  forums?: Forum
}