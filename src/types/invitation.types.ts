import type { User } from './auth.types'
import type { Company } from './company.types'

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export interface Invitation {
  id: string
  user_id: string
  company_id: string
  status: InvitationStatus
  user?: User
  company?: Company
}

export interface CreateInvitationData {
  user_id: string
  company_id: string
}

export interface UpdateInvitationData {
  status: InvitationStatus
}
