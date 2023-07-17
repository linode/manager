export const mockAxiosError = {
  config: {},
  message: 'error',
  name: 'hello world',
};

export const mockAxiosErrorWithAPIErrorContent = {
  config: {},
  message: 'error',
  name: 'hello world',
  response: {
    config: {},
    data: {
      errors: [{ field: 'Error', reason: 'A reason' }],
    },
    headers: null,
    status: 0,
    statusText: 'status',
  },
};
