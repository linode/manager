import { createAPIError, mapAPIErrorsToObject, mapErrorToObject } from './apiErrorHandling';

describe('utilities/apiErrorHandling', () => {

  describe('createAPIError', () => {
    it('Creates general error.', () => {
      expect(createAPIError('message')).toEqual({ reason: 'message' });
    });

    it('Create field error.', () => {
      expect(createAPIError('message', 'field')).toEqual({ field: 'field', reason: 'message' });
    });
  });

  describe('mapErrorToObject', () => {

    describe('when given a general error', () => {
      it('should return an object with a key of __general and a value of the error message.', () => {
        const reason = 'This is a general error.';
        const { __general } = mapErrorToObject(createAPIError(reason));

        expect(__general).toEqual(reason)
      });
    });

    describe('when given a field error', () => {
      const reason = 'This is a field error.'
      const field = 'shenanigans'
      const { __general, shenanigans } = mapErrorToObject(createAPIError(reason, field));

      it('should return an object with keys for each error field with values of the error message.', () => {
        expect(shenanigans).toEqual(reason);
      });
      it('should return not return a __general error.', () => {
        expect(__general).toBeUndefined();
      });
    });
  });

  describe('mapAPIErrorsToObject', () => {
    it('should return an empty if given an empty object.', () => {
      const result = mapAPIErrorsToObject([]);

      expect(result).toEqual({})
    });

    it('should return a key:value pair for each error.', () => {
      const result = mapAPIErrorsToObject([
        createAPIError('general error'),
        createAPIError('field a error', 'fieldA'),
      ]);

      expect(result).toEqual({
        __general: 'general error',
        fieldA: 'field a error'
      })
    });

    it('should overwrite existing errors.', () => {
      const result = mapAPIErrorsToObject([
        createAPIError('general error'),
        createAPIError('field a error', 'fieldA'),
        createAPIError('updated field a error', 'fieldA'),
      ]);

      expect(result).toEqual({
        __general: 'general error',
        fieldA: 'updated field a error'
      })
    });
  });
});
