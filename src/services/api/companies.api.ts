import type { Company, CreateCompanyData, UpdateCompanyData } from '@/types/company.types'
import { apiClient } from './client'

interface CompanyResponse {
  data: Company
}

interface CreateCompanyResponse {
  message: string
  data: Company
}

interface UpdateCompanyResponse {
  message: string
  data: Company
}

// Преобразуем ответ сервера в Company
const mapCompanyResponse = (companyData: any): Company => {
  return {
    id: String(companyData.id),
    title: companyData.title,
    INN: companyData.INN,
    KPP: companyData.KPP,
    OGRN: companyData.OGRN,
    address: companyData.address,
    phone: companyData.phone,
    email: companyData.email,
    checking_account: companyData.checking_account,
    bank_name: companyData.bank_name,
    BIK: companyData.BIK,
    correspondent_account: companyData.correspondent_account,
    users: companyData.users || [],
  }
}

export const companiesApi = {
  async getCompanyById(id: string): Promise<Company | null> {
    try {
      const response = await apiClient.get<CompanyResponse>(`/companies/${id}`)
      return mapCompanyResponse(response.data)
    } catch (error) {
      console.error('Error fetching company:', error)
      return null
    }
  },

  async createCompany(data: CreateCompanyData): Promise<Company> {
    const response = await apiClient.post<CreateCompanyResponse>('/companies', data)
    return mapCompanyResponse(response.data)
  },

  async updateCompany(id: string, data: UpdateCompanyData): Promise<Company> {
    const response = await apiClient.put<UpdateCompanyResponse>(`/companies/${id}`, data)
    return mapCompanyResponse(response.data)
  },

  async deleteCompany(id: string): Promise<void> {
    await apiClient.delete(`/companies/${id}`)
  },
}
