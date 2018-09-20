import { object, string } from 'yup';

import Request, { setData } from './index';

describe('services', () => {
  describe('Request', () => {
    describe('validateRequestData', async () => {
      /**
       * This is testing that a specific error is being returned.
       */
      it('should return specific error message', () => {
        const data = { label: 1234 };
        const schema = object().shape({
          region: string().required('A region is required.'),
        });

        return Request(setData(data, schema))
          .catch((response) => {
            expect(response.response.data.errors).toEqual([{
              field: 'region',
              reason: `A region is required.`,
            }]);
          });
      });
    });
  });
});
