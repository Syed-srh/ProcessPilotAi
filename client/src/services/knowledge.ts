import { api } from './api';

export interface PolicyDocument {
  id: string;
  title: string;
  content: string;
  chunkCount: number;
  updatedAt: string;
}

export interface CurrentPolicyResponse {
  active: boolean;
  document: PolicyDocument | null;
}

export const getCurrentPolicy = async (): Promise<CurrentPolicyResponse> => {
  const response = await api.get('/knowledge/documents/current');
  return response.data.data;
};

export const uploadPolicyDocument = async (title: string, content: string): Promise<{ documentId: string; chunkCount: number }> => {
  const response = await api.post('/knowledge/documents', { title, content });
  return response.data.data;
};
