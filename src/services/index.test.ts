import * as Joi from 'joi';

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
        const schema = Joi.object().keys({
          label: Joi.string().required(),
        });

        return Request(
          validateRequestData(data, schema),
        )
          .catch((response) => {
            expect(response.response.data.errors).toEqual([{
              field: 'label',
              reason: `Please check your data and try again.`,
            }]);
          });
      });

      /**
       * This is testing that a specific error is being returned.
       */
      it('should return specific error message', () => {
        const data = { label: 1234 };
        const schema = Joi.object().keys({
          region: Joi.string().required(),
        });

        return Request(
          validateRequestData(data, schema),
        )
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
