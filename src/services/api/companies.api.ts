import type { Company, CreateCompanyData, CompanyMember } from '@/types/company.types'
import type { User, UserRole } from '@/types/auth.types'
import { mockCompanies } from '@/services/mock/companies.mock'
import { mockUsers } from '@/services/mock/auth.mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const companiesApi = {
  async getCompanies(): Promise<Company[]> {
    await delay()
    return mockCompanies
  },

  async getCompanyById(id: string): Promise<Company | null> {
    await delay()
    return mockCompanies.find(c => c.id === id) || null
  },

  async createCompany(data: CreateCompanyData): Promise<Company> {
    await delay()
    const newCompany: Company = {
      id: 'company-' + Date.now(),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      members: [],
    }
    mockCompanies.push(newCompany)
    return newCompany
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    await delay()
    const index = mockCompanies.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Company not found')

    mockCompanies[index] = { ...mockCompanies[index]!, ...data } as Company
    return mockCompanies[index]!
  },

  // Добавить участника в компанию
  async addMember(companyId: string, userId: string, role: UserRole): Promise<Company> {
    await delay()

    const company = mockCompanies.find(c => c.id === companyId)
    if (!company) throw new Error('Компания не найдена')

    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('Пользователь не найден')

    // Проверяем, не является ли пользователь уже участником
    const existingMember = company.members.find(m => m.userId === userId)
    if (existingMember) throw new Error('Пользователь уже является участником компании')

    const newMember: CompanyMember = {
      userId,
      user,
      role,
      joinedAt: new Date().toISOString(),
    }

    company.members.push(newMember)

    // Обновляем информацию о компании в пользователе
    user.companyId = companyId
    user.role = role

    return company
  },

  // Удалить участника из компании
  async removeMember(companyId: string, userId: string): Promise<Company> {
    await delay()

    const company = mockCompanies.find(c => c.id === companyId)
    if (!company) throw new Error('Компания не найдена')

    const memberIndex = company.members.findIndex(m => m.userId === userId)
    if (memberIndex === -1) throw new Error('Участник не найден')

    company.members.splice(memberIndex, 1)

    // Обновляем информацию в пользователе
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      user.companyId = undefined
      user.role = 'user' as UserRole
    }

    return company
  },

  // Изменить роль участника
  async updateMemberRole(companyId: string, userId: string, newRole: UserRole): Promise<Company> {
    await delay()

    const company = mockCompanies.find(c => c.id === companyId)
    if (!company) throw new Error('Компания не найдена')

    const member = company.members.find(m => m.userId === userId)
    if (!member) throw new Error('Участник не найден')

    member.role = newRole

    // Обновляем роль в пользователе
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      user.role = newRole
    }

    return company
  },
}
