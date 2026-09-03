import api from '../lib/api';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface GendersDropdownResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    gendersDropdown: DropdownOption[];
  };
}

export const dropdownsApi = {
  getAllGenders: async () => {
    const { data } = await api.get<GendersDropdownResponse>(
      '/customers/getAllGenders'
    );
    return data;
  },
};
