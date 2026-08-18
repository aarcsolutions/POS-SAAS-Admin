import api from '../lib/api';

export type UploadFileResult = {
  fileKey: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  bucketName: string;
  url?: string;
};

export type FileUrlResult = {
  url: string;
  fileKey: string;
  expiresAt: string;
  expiresIn: number;
};

export const filesApi = {
  uploadFile: async (file: File, type = 'products') => {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);

    const { data } = await api.post('/files/uploadFile', form, {
      timeout: 120000,
      transformRequest: [
        (body, headers) => {
          if (typeof FormData !== 'undefined' && body instanceof FormData) {
            delete (headers as Record<string, unknown>)['Content-Type'];
          }
          return body;
        },
      ],
    });
    return data as {
      status: boolean;
      message: string;
      data: UploadFileResult;
    };
  },

  getFileUrl: async (fileKey: string, expires = 86400) => {
    const encoded = fileKey
      .split('/')
      .map(encodeURIComponent)
      .join('/');
    const { data } = await api.get(`/files/getFileUrl/${encoded}`, {
      params: { expires },
    });
    return data as {
      status: boolean;
      message: string;
      data: FileUrlResult;
    };
  },

  /** Upload then resolve a long-lived signed URL for storing on the product. */
  uploadAndResolveUrl: async (file: File, type = 'products') => {
    const uploaded = await filesApi.uploadFile(file, type);
    if (!uploaded.status || !uploaded.data?.fileKey) {
      throw new Error(uploaded.message || 'Upload failed');
    }

    // Local storage already returns a durable public URL
    if (uploaded.data.url) {
      return {
        fileKey: uploaded.data.fileKey,
        url: uploaded.data.url,
      };
    }

    const urlRes = await filesApi.getFileUrl(uploaded.data.fileKey, 86400);
    return {
      fileKey: uploaded.data.fileKey,
      url: urlRes.data?.url || uploaded.data.fileKey,
    };
  },
};
