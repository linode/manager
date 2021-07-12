import { PromoCodeSchema } from '@linode/validation/lib/account.schema';
import { API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';
import { ActivePromotion } from './types';

/**
 * addPromotion
 *
 * Add an expiring credit (promotion) to an existing account.
 * This is only possible if:
 * - The user is unrestricted
 * - The account is fewer than 90 days old
 * - No promotions are currently active on the account
 * - The code is a valid expiring credit (it has not expired and has a
 *   credit_months field, after which it will expire)
 *
 */
export const addPromotion = (code: string) =>
  Request<ActivePromotion>(
    setURL(`${API_ROOT}/account/promo-codes`),
    setMethod('POST'),
    setData({ promo_code: code }, PromoCodeSchema)
  );
