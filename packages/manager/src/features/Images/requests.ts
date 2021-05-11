import Axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = Axios.create({});

// application/octet-stream is the only Content-Type accepted
const headerContentType = 'application/octet-stream';

export const uploadImageFile = (
  signedUrl: string,
  file: File,
  onUploadProgress: (e: ProgressEvent) => void
) => {
  const config: AxiosRequestConfig = {
    url: signedUrl,
    method: 'PUT',
    headers: {
      'Content-Type': headerContentType,
    },
    data: file,
    onUploadProgress,
  };
  return axiosInstance.request(config);
};
