import type { Invitation, InvitationStatus, CreateInvitationData, UpdateInvitationData } from '@/types/invitation.types'
import { apiClient } from './client'

interface InvitationsResponse {
  data: Invitation[]
}

interface CreateInvitationResponse {
  message: string
  data: Invitation
}

interface UpdateInvitationResponse {
  message: string
  data: Invitation
}

// Преобразуем ответ сервера в Invitation
const mapInvitationResponse = (invitationData: any): Invitation => {
  return {
    id: String(invitationData.id),
    user_id: String(invitationData.user_id),
    company_id: String(invitationData.company_id),
    status: mapInvitationStatus(invitationData.status),
    user: invitationData.user,
    company: invitationData.company,
  }
}

// Преобразуем статус приглашения
const mapInvitationStatus = (status: string): InvitationStatus => {
  const statusMap: Record<string, InvitationStatus> = {
    'pending': InvitationStatus.PENDING,
    'accepted': InvitationStatus.ACCEPTED,
    'rejected': InvitationStatus.REJECTED,
    'canceled': InvitationStatus.CANCELED,
  }
  
  return statusMap[status.toLowerCase()] || InvitationStatus.PENDING
}

export const invitationsApi = {
  async getUserInvitations(): Promise<Invitation[]> {
    const response = await apiClient.get<InvitationsResponse>('/invitations')
    return (response.data || []).map(mapInvitationResponse)
  },

  async createInvitation(data: CreateInvitationData): Promise<Invitation> {
    const response = await apiClient.post<CreateInvitationResponse>('/invitations', data)
    return mapInvitationResponse(response.data)
  },

  async updateInvitation(id: string, data: UpdateInvitationData): Promise<Invitation> {
    const response = await apiClient.put<UpdateInvitationResponse>(`/invitations/${id}`, data)
    return mapInvitationResponse(response.data)
  },

  async acceptInvitation(invitationId: string): Promise<Invitation> {
    return this.updateInvitation(invitationId, { status: InvitationStatus.ACCEPTED })
  },

  async rejectInvitation(invitationId: string): Promise<Invitation> {
    return this.updateInvitation(invitationId, { status: InvitationStatus.REJECTED })
  },
}
