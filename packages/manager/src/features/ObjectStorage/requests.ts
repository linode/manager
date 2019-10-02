import Axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = Axios.create({});

export const uploadObject = (
  signedUrl: string,
  file: File,
  onUploadProgress: (e: ProgressEvent) => void
) => {
  const config: AxiosRequestConfig = {
    url: signedUrl,
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    data: file,
    onUploadProgress
  };
  return axiosInstance.request(config);
};

export const deleteObject = (signedUrl: string) => {
  const config: AxiosRequestConfig = {
    url: signedUrl,
    method: 'DELETE'
  };
  return axiosInstance.request(config);
};
