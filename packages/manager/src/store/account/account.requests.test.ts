import { accountFactory, promoFactory } from 'src/factories/account';
import { requestAccount, updateAccount } from './account.requests';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureMockStore([thunk]);

jest.mock('@linode/api-v4/lib/account', () => {
  const goodPromo = promoFactory.build();
  const badPromo = promoFactory.build({ expire_dt: null });
  const mockAccount = accountFactory.build({
    active_promotions: [goodPromo, badPromo],
  });
  return {
    getAccountInfo: jest.fn().mockResolvedValue(mockAccount),
    updateAccountInfo: jest.fn().mockResolvedValue(mockAccount),
  };
});

describe('Requesting account data', () => {
  it('should strip out invalid promos when requesting data', async () => {
    const store = mockStore();
    const accountData = await store.dispatch(requestAccount() as any);
    expect(accountData.active_promotions).toHaveLength(1);
    expect(accountData.active_promotions[0]).not.toHaveProperty(
      'expire_dt',
      null
    );
  });

  it('should strip out invalid promos from the response when updating data', async () => {
    const store = mockStore();
    const accountData = await store.dispatch(
      updateAccount(accountFactory.build({ balance_uninvoiced: 1000 })) as any
    );
    expect(accountData.active_promotions).toHaveLength(1);
    expect(accountData.active_promotions[0]).not.toHaveProperty(
      'expire_dt',
      null
    );
  });
});
