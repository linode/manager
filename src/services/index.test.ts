import Request, { validateRequestData } from './index';

describe('services', () => {
  describe('Request', () => {
    describe('validateRequestData', async () => {
      /**
       * This tests that a generic error message is returned
       * in the event a mapped error message could not be found.
       */
      it('should return generic message', () => {
        const data = { label: 1234 };
        const schema = {
          label: {
            string: true,
            presence: true,
          },
        };

        return Request(
          validateRequestData(data, schema),
        )
          .catch((response) => {
            expect(response.response.data.errors).toEqual([{
              field: 'label',
              reason: 'Label is not a string',
            }]);
          });
      });

      /**
       * This is testing that a specific error is being returned.
       */
      it('should return specific error message', () => {
        const data = { label: 1234 };
        const schema = {
          region: {
            presence: { message: 'is required' },
          },
        };

        return Request(
          validateRequestData(data, schema),
        )
          .catch((response) => {
            expect(response.response.data.errors).toEqual([{
              field: 'region',
              reason: `Region is required`,
            }]);
          });
      });
    });
  });
});
