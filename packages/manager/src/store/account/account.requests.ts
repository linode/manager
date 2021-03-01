import {
  Account,
  getAccountInfo,
  updateAccountInfo,
} from '@linode/api-v4/lib/account';

import { createRequestThunk } from '../store.helpers';
import { requestAccountActions, updateAccountActions } from './account.actions';

export const stripInvalidPromos = (data: Account) => {
  /**
   * It's possible for an incorrectly created Expiring Credit
   * to have an expire_dt of null. Admin and billing ignore
   * such promos, but since when showing billing info
   * we only display the first promo we find
   * (there's only supposed to be one active per account), once
   * a user has one of these "phantom" credits on their account
   * that's all we'll ever show.
   *
   * Although this situation is unlikely to happen (again), since
   * Admin ignores these we should strip them out. PDI 1268 has
   * more details.
   */
  const { active_promotions } = data;
  const filteredPromotions = active_promotions.filter(
    (thisPromotion) => thisPromotion.expire_dt !== null
  );
  return {
    ...data,
    active_promotions: filteredPromotions,
  };
};

export const requestAccount = createRequestThunk(requestAccountActions, () =>
  getAccountInfo().then(stripInvalidPromos)
);

export const updateAccount = createRequestThunk(
  updateAccountActions,
  ({ ...data }) => updateAccountInfo(data).then(stripInvalidPromos)
);
