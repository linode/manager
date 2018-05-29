import * as Joi from 'joi';

import Request, { validateRequestData } from './index';

describe('services', () => {
  describe('Request', () => {
    it('validateRequestData', async () => {
      const data = { label: 1234 };
      const schema = Joi.object().keys({
        label: Joi.string().required(),
      });

      return Request(
        validateRequestData(data, schema),
      )
        .catch((response) => {
          expect(response.response.data.errors).toEqual([`"label" must be a string`]);
        });

    });
  });
});
