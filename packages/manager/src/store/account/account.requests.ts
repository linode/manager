import {
  Account,
  getAccountInfo,
  updateAccountInfo
} from 'linode-js-sdk/lib/account';

import { ThunkActionCreator } from 'src/store/types';
import { createRequestThunk } from '../store.helpers';
import {
  profileRequest,
  profileRequestFail,
  profileRequestSuccess,
  updateAccountActions
} from './account.actions';

export const stripInvalidPromos = (data: Account) => {
  /**
   * It's possible for an incorrectly created Expiring Credit
   * to have an expire_dt of null. Admin and billing ignore
   * such promos, but since we only display the first promo we find
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
    thisPromotion => thisPromotion.expire_dt !== null
  );
  return {
    ...data,
    active_promotions: filteredPromotions
  };
};

export const requestAccount: ThunkActionCreator<Promise<
  Account
>> = () => dispatch => {
  dispatch(profileRequest());
  return getAccountInfo()
    .then(stripInvalidPromos)
    .then(response => {
      dispatch(profileRequestSuccess(response));
      return response;
    })
    .catch(err => {
      dispatch(profileRequestFail(err));
      return err;
    });
};

export const updateAccount = createRequestThunk(
  updateAccountActions,
  ({ ...data }) => updateAccountInfo(data).then(stripInvalidPromos)
);
