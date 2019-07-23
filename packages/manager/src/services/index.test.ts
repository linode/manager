import { object, string } from 'yup';

import Request, { setData } from './index';

describe('services', () => {
  describe('Request', () => {
    describe('validateRequestData', () => {
      /**
       * This is testing that a specific error is being returned.
       */
      it('should return specific error message', () => {
        expect.assertions(1);
        const data = { label: 1234 };
        const schema = object().shape({
          region: string().required('A region is required.')
        });

        const request = Request(setData(data, schema));
        return expect(request).rejects.toEqual([
          {
            field: 'region',
            reason: `A region is required.`
          }
        ]);
      });
    });
  });
});
