import type { Invitation, InvitationStatus, CreateInvitationData } from '@/types/invitation.types'
import { mockUsers } from '@/services/mock/auth.mock'
import { mockCompanies } from '@/services/mock/companies.mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const INVITATIONS_STORAGE_KEY = 'company_invitations'

// Получить все приглашения из localStorage
const getAllInvitations = (): Invitation[] => {
  try {
    const data = localStorage.getItem(INVITATIONS_STORAGE_KEY)
    return data ? (JSON.parse(data) as Invitation[]) : []
  } catch {
    return []
  }
}

// Сохранить все приглашения в localStorage
const saveAllInvitations = (invitations: Invitation[]): void => {
  try {
    localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invitations))
  } catch (error) {
    console.error('Error saving invitations:', error)
  }
}

export const invitationsApi = {
  // Получить приглашения для пользователя
  async getUserInvitations(userId: string): Promise<Invitation[]> {
    await delay()

    const invitations = getAllInvitations()
    return invitations.filter((inv) => inv.invitedUserId === userId)
  },

  // Получить приглашения компании
  async getCompanyInvitations(companyId: string): Promise<Invitation[]> {
    await delay()

    const invitations = getAllInvitations()
    return invitations.filter((inv) => inv.companyId === companyId)
  },

  // Отправить приглашение
  async createInvitation(
    invitedByUserId: string,
    data: CreateInvitationData,
  ): Promise<Invitation> {
    await delay()

    const invitedUser = mockUsers.find((u) => u.id === data.invitedUserId)
    if (!invitedUser) {
      throw new Error('Пользователь не найден')
    }

    // Проверяем, не состоит ли пользователь уже в компании
    if (invitedUser.companyId) {
      throw new Error('Пользователь уже состоит в компании')
    }

    const company = mockCompanies.find((c) => c.id === data.companyId)
    if (!company) {
      throw new Error('Компания не найдена')
    }

    const invitedByUser = mockUsers.find((u) => u.id === invitedByUserId)
    if (!invitedByUser) {
      throw new Error('Отправитель не найден')
    }

    // Проверяем, нет ли уже активного приглашения
    const invitations = getAllInvitations()
    const existingInvitation = invitations.find(
      (inv) =>
        inv.invitedUserId === data.invitedUserId &&
        inv.companyId === data.companyId &&
        inv.status === 'pending',
    )

    if (existingInvitation) {
      throw new Error('Приглашение уже отправлено')
    }

    const newInvitation: Invitation = {
      id: `invitation-${Date.now()}`,
      companyId: data.companyId,
      company,
      invitedUserId: data.invitedUserId,
      invitedUser,
      invitedByUserId,
      invitedByUser,
      status: 'pending' as InvitationStatus,
      message: data.message,
      createdAt: new Date().toISOString(),
    }

    invitations.push(newInvitation)
    saveAllInvitations(invitations)

    return newInvitation
  },

  // Принять приглашение
  async acceptInvitation(invitationId: string, userId: string): Promise<Invitation> {
    await delay()

    const invitations = getAllInvitations()
    const invitation = invitations.find((inv) => inv.id === invitationId)

    if (!invitation) {
      throw new Error('Приглашение не найдено')
    }

    if (invitation.invitedUserId !== userId) {
      throw new Error('Нет прав для принятия этого приглашения')
    }

    if (invitation.status !== 'pending') {
      throw new Error('Приглашение уже обработано')
    }

    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      throw new Error('Пользователь не найден')
    }

    // Проверяем, не состоит ли пользователь уже в компании
    if (user.companyId) {
      throw new Error('Вы уже состоите в компании')
    }

    // Обновляем приглашение
    invitation.status = 'accepted' as InvitationStatus
    invitation.respondedAt = new Date().toISOString()

    // Добавляем пользователя в компанию
    const company = mockCompanies.find((c) => c.id === invitation.companyId)
    if (company) {
      company.members.push({
        userId: user.id,
        user,
        role: 'company_manager' as any,
        joinedAt: new Date().toISOString(),
      })
    }

    // Обновляем пользователя
    user.companyId = invitation.companyId
    user.role = 'company_manager' as any

    // Отклоняем все остальные pending приглашения для этого пользователя
    invitations.forEach((inv) => {
      if (inv.invitedUserId === userId && inv.status === 'pending' && inv.id !== invitationId) {
        inv.status = 'rejected' as InvitationStatus
        inv.respondedAt = new Date().toISOString()
      }
    })

    saveAllInvitations(invitations)

    return invitation
  },

  // Отклонить приглашение
  async rejectInvitation(invitationId: string, userId: string): Promise<Invitation> {
    await delay()

    const invitations = getAllInvitations()
    const invitation = invitations.find((inv) => inv.id === invitationId)

    if (!invitation) {
      throw new Error('Приглашение не найдено')
    }

    if (invitation.invitedUserId !== userId) {
      throw new Error('Нет прав для отклонения этого приглашения')
    }

    if (invitation.status !== 'pending') {
      throw new Error('Приглашение уже обработано')
    }

    invitation.status = 'rejected' as InvitationStatus
    invitation.respondedAt = new Date().toISOString()

    saveAllInvitations(invitations)

    return invitation
  },

  // Отменить приглашение (для отправителя)
  async cancelInvitation(invitationId: string, userId: string): Promise<void> {
    await delay()

    const invitations = getAllInvitations()
    const index = invitations.findIndex((inv) => inv.id === invitationId)

    if (index === -1) {
      throw new Error('Приглашение не найдено')
    }

    const invitation = invitations[index]!

    if (invitation.invitedByUserId !== userId) {
      throw new Error('Нет прав для отмены этого приглашения')
    }

    if (invitation.status !== 'pending') {
      throw new Error('Можно отменить только активные приглашения')
    }

    invitations.splice(index, 1)
    saveAllInvitations(invitations)
  },
}
