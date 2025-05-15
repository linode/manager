import Axios from 'axios';

import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios';

const axiosInstance = Axios.create({});

export const uploadObject = (
  signedUrl: string,
  file: File,
  onUploadProgress: (e: AxiosProgressEvent) => void
) => {
  const config: AxiosRequestConfig = {
    data: file,
    headers: {
      'Content-Type': file.type,
    },
    method: 'PUT',
    onUploadProgress,
    url: signedUrl,
  };
  return axiosInstance.request(config);
};

export const deleteObject = (signedUrl: string) => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    url: signedUrl,
  };
  return axiosInstance.request(config);
};
