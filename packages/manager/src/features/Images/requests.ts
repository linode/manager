import Axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = Axios.create({});

// application/octet-stream is the only Content-Type accepted
const headerContentType = 'application/octet-stream';

export const uploadImageFile = (
  signedUrl: string,
  file: File,
  onUploadProgress: (e: ProgressEvent) => void
) => {
  const CancelToken = Axios.CancelToken;
  const source = CancelToken.source();

  const config: AxiosRequestConfig = {
    url: signedUrl,
    method: 'PUT',
    headers: {
      'Content-Type': headerContentType,
    },
    data: file,
    onUploadProgress,
    cancelToken: source.token,
  };
  return {
    request: () => axiosInstance.request(config),
    // Return the cancel function to the client, since this is a long-running
    // request that the user may want to cancel.
    cancel: source.cancel,
  };
};
