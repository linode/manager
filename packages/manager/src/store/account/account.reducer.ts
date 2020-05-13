import produce from 'immer';
import { Account } from 'linode-js-sdk/lib/account';
import { Reducer } from 'redux';
import { RequestableDataWithEntityError } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  requestAccountActions,
  saveCreditCard,
  updateAccountActions
} from './account.actions';

/**
 * State
 */
export type State = RequestableDataWithEntityError<Account>;

export const defaultState: State = {
  loading: false,
  error: {},
  lastUpdated: 0,
  data: undefined
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state: State = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, requestAccountActions.started)) {
      draft.loading = true;
    }

    if (isType(action, requestAccountActions.done)) {
      const { result } = action.payload;

      draft.loading = false;
      draft.data = {
        ...result,
        balance: -20,
        balance_uninvoiced: 20,
        active_promotions: [
          {
            credit_monthly_cap: '10.00',
            credit_remaining: '50.00',
            description:
              'Receive up to $10 off your services every month for 6 months! Unused credits will expire once this promotion period ends.',
            expire_dt: '2018-01-31T23:59:59',
            image_url: 'https://linode.com/10_a_month_promotion.svg',
            summary: '$10 off your Linode a month!',
            this_month_credit_remaining: '10.00'
          }
        ]
      };
      draft.lastUpdated = Date.now();
      draft.error.read = undefined;
    }

    if (isType(action, requestAccountActions.failed)) {
      const { error } = action.payload;

      draft.loading = false;
      draft.error.read = error;
    }

    if (isType(action, updateAccountActions.started)) {
      draft.loading = true;
      draft.error.update = undefined;
    }

    if (isType(action, updateAccountActions.done)) {
      const { result } = action.payload;

      draft.loading = false;
      draft.data = result;
      draft.lastUpdated = Date.now();
      draft.error.update = undefined;
      draft.error.read = undefined;
    }

    if (isType(action, updateAccountActions.failed)) {
      const { error } = action.payload;

      draft.loading = false;
      draft.error.update = error;
    }

    if (isType(action, saveCreditCard)) {
      const { payload } = action;

      // This action updates a nested slice of `data.` If `data` is undefined,
      // don't do anything. This situation is impossible in practice but the
      // logic is here to make the TypeScript compiler happy.
      if (!draft.data) {
        return;
      }

      draft.data.credit_card = payload;
    }
  });
};

export default reducer;
