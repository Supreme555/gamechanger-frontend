import apiClient from '../axios';

export interface Deal {
  id: number;
  title: string;
  dateCreate: string;
  stageId: string;
  stageName?: string;
  categoryId: number;
}

export interface DealDetails {
  id: number;
  title: string;
  dateCreate: string;
  dateModify: string;
  stageId: string;
  stageName?: string;
  categoryId: number;
  opportunity: number;
  currencyId: string;
  assignedById: number;
  contactId?: number;
  companyId?: number;
  comments?: string;
  closeDate?: string;
  opened: boolean;
  closed: boolean;
  typeId: string;
  probability: number;
  sourceId?: string;
  sourceDescription?: string;
}

export interface DealsListResponse {
  items: Deal[];
  next: number | null;
}

export interface CreateDealDto {
  title: string;
  stageId?: string;
  opportunity?: number;
  currencyId?: string;
  assignedById?: number;
  contactId?: number;
  companyId?: number;
  comments?: string;
  closeDate?: string;
  categoryId?: number;
  productRows?: Array<{
    productId: number;
    price: number;
    quantity: number;
  }>;
}

export interface CreateDealResponse {
  id: number;
  title: string;
  stageId: string;
  opportunity?: number;
  currencyId?: string;
  assignedById?: number;
  contactId?: number;
  companyId?: number;
  comments?: string;
  closeDate?: string;
  categoryId: number;
}

export class DealsService {
  /**
   * Получить список всех сделок
   */
  static async getDeals(params?: {
    start?: number;
    limit?: number;
  }): Promise<DealsListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.start) {
      searchParams.append('start', params.start.toString());
    }
    
    if (params?.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const queryString = searchParams.toString();
    const url = `/bitrix24/deals${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<DealsListResponse>(url);
    return response.data;
  }

  /**
   * Получить детальную информацию о сделке по ID
   */
  static async getDealById(id: number): Promise<DealDetails> {
    const response = await apiClient.get<DealDetails>(`/bitrix24/deals/${id}`);
    return response.data;
  }

  /**
   * Создать новую сделку
   */
  static async createDeal(data: CreateDealDto): Promise<CreateDealResponse> {
    const response = await apiClient.post<CreateDealResponse>('/bitrix24/deals', data);
    return response.data;
  }

  /**
   * Повторить заказ (создать новую сделку на основе существующей)
   */
  static async repeatDeal(id: number): Promise<CreateDealResponse> {
    const response = await apiClient.post<CreateDealResponse>(`/bitrix24/deals/repeat/${id}`);
    return response.data;
  }

  /**
   * Обновить сделку
   */
  static async updateDeal(id: number, data: Partial<CreateDealDto>): Promise<DealDetails> {
    const response = await apiClient.put<DealDetails>(`/bitrix24/deals/${id}`, data);
    return response.data;
  }

  /**
   * Удалить сделку
   */
  static async deleteDeal(id: number): Promise<void> {
    await apiClient.delete(`/bitrix24/deals/${id}`);
  }
}
