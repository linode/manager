import Axios from 'axios';

import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios';

const axiosInstance = Axios.create({});

// application/octet-stream is the only Content-Type accepted
const headerContentType = 'application/octet-stream';

export const uploadImageFile = (
  signedUrl: string,
  file: File,
  onUploadProgress: (e: AxiosProgressEvent) => void
) => {
  const CancelToken = Axios.CancelToken;
  const source = CancelToken.source();

  const config: AxiosRequestConfig = {
    cancelToken: source.token,
    data: file,
    headers: {
      'Content-Type': headerContentType,
    },
    method: 'PUT',
    onUploadProgress,
    url: signedUrl,
  };
  return {
    // request that the user may want to cancel.
    cancel: source.cancel,
    // Return the cancel function to the client, since this is a long-running
    request: () => axiosInstance.request(config),
  };
};
