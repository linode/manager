import { DeepPartial } from 'redux';
import { ApplicationState } from 'src/store';

export const withRestrictedUser: DeepPartial<ApplicationState> = {
  __resources: {
    profile: {
      data: {
        restricted: true,
        grants: {
          global: {
            account_access: false,
          } as any,
        },
      } as any,
    },
  },
};

export const withLinodesLoaded = {
  __resources: { linodes: { loading: false, lastUpdated: 1 } },
};
