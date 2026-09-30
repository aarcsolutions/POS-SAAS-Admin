import api from '../lib/api';
import {
  AssignRawMaterialPayload,
  AssignSupplierItemPayload,
  CreatePurchasePayload,
  MatchByItemsPayload,
  MatchByItemsResponse,
  MatchByMaterialsResponse,
  PurchaseDetailResponse,
  PurchasesListResponse,
  PurchaseItemPayload,
  SupplierDetailResponse,
  SupplierPayload,
  SuppliersListResponse,
} from '@/types/supplier.types';

export const suppliersApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      branch_id?: string;
    } = {}
  ) => {
    const { data } = await api.get<SuppliersListResponse>('/suppliers/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<SupplierDetailResponse>(
      `/suppliers/getById/${id}`
    );
    return data;
  },

  create: async (payload: SupplierPayload) => {
    const { data } = await api.post('/suppliers/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<SupplierPayload>) => {
    const { data } = await api.put('/suppliers/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/suppliers/delete', { data: { id } });
    return data;
  },

  assignRawMaterial: async (payload: AssignRawMaterialPayload) => {
    const { data } = await api.post('/suppliers/assignRawMaterial', payload);
    return data;
  },

  updateAssignedRawMaterial: async (
    id: string,
    payload: Partial<AssignRawMaterialPayload>
  ) => {
    const { data } = await api.put('/suppliers/updateAssignedRawMaterial', {
      id,
      ...payload,
    });
    return data;
  },

  unassignRawMaterial: async (id: string) => {
    const { data } = await api.delete('/suppliers/unassignRawMaterial', {
      data: { id },
    });
    return data;
  },

  getAssignedRawMaterials: async (supplierId: string) => {
    const { data } = await api.get(
      `/suppliers/getAssignedRawMaterials/${supplierId}`
    );
    return data;
  },

  matchByMaterials: async (raw_material_ids: string[]) => {
    const { data } = await api.post<MatchByMaterialsResponse>(
      '/suppliers/matchByMaterials',
      { raw_material_ids }
    );
    return data;
  },

  assignItem: async (payload: AssignSupplierItemPayload) => {
    const { data } = await api.post('/suppliers/assignItem', payload);
    return data;
  },

  getAssignedItems: async (supplierId: string) => {
    const { data } = await api.get(
      `/suppliers/getAssignedItems/${supplierId}`
    );
    return data;
  },

  matchByItems: async (payload: MatchByItemsPayload) => {
    const { data } = await api.post<MatchByItemsResponse>(
      '/suppliers/matchByItems',
      payload
    );
    return data;
  },

  createPurchase: async (payload: CreatePurchasePayload) => {
    const { data } = await api.post('/suppliers/createPurchase', payload);
    return data;
  },

  updatePurchase: async (
    id: string,
    payload: { supplier_id?: string; items?: PurchaseItemPayload[] }
  ) => {
    const { data } = await api.put('/suppliers/updatePurchase', {
      id,
      ...payload,
    });
    return data;
  },

  markOrdered: async (id: string) => {
    const { data } = await api.post('/suppliers/markOrdered', { id });
    return data;
  },

  receivePurchase: async (
    id: string,
    items?: Array<{
      id: string;
      received_quantity: number;
      price?: number;
    }>
  ) => {
    const { data } = await api.post('/suppliers/receivePurchase', {
      id,
      items,
    });
    return data;
  },

  cancelPurchase: async (id: string) => {
    const { data } = await api.post('/suppliers/cancelPurchase', { id });
    return data;
  },

  sendPurchaseEmail: async (id: string) => {
    const { data } = await api.post('/suppliers/sendPurchaseEmail', { id });
    return data;
  },

  getAllPurchases: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      branch_id?: string;
    } = {}
  ) => {
    const { data } = await api.get<PurchasesListResponse>(
      '/suppliers/getAllPurchases',
      { params }
    );
    return data;
  },

  getPurchaseById: async (id: string) => {
    const { data } = await api.get<PurchaseDetailResponse>(
      `/suppliers/getPurchaseById/${id}`
    );
    return data;
  },
};
