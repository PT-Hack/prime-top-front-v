import type { User } from './auth.types'
import type { Company } from './company.types'

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface Invitation {
  id: string
  companyId: string
  company: Company
  invitedUserId: string
  invitedUser: User
  invitedByUserId: string
  invitedByUser: User
  status: InvitationStatus
  message?: string
  createdAt: string
  respondedAt?: string
}

export interface CreateInvitationData {
  companyId: string
  invitedUserId: string
  message?: string
}
