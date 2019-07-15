import { createPromiseLoaderResponse, createResourcePage } from './testHelpers';

describe('createPromiseLoader', () => {
  it('should return values in a PromiseLoader shape.', () => {
    expect(createPromiseLoaderResponse([])).toEqual({ response: [] });
  });
});

describe('createResourcePage', () => {
  it('should return values in a PromiseLoader shape.', () => {
    expect(createResourcePage([])).toEqual({
      data: [],
      page: 0,
      pages: 0,
      number: 1,
      results: 0
    });
  });
});
