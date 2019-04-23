export const mockAxiosError = {
  config: {},
  name: 'hello world',
  message: 'error'
};

export const mockAxiosErrorWithAPIErrorContent = {
  config: {},
  name: 'hello world',
  message: 'error',
  response: {
    status: 0,
    statusText: 'status',
    headers: null,
    config: {},
    data: {
      errors: [{ field: 'Error', reason: 'A reason' }]
    }
  }
};
