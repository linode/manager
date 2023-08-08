import { APIError, AccountSettings, LinodeType } from '@linode/api-v4';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { UseQueryResult } from 'react-query';

import { accountSettingsFactory } from 'src/factories';
import { linodeFactory } from 'src/factories/linodes';
import { queryClientFactory } from 'src/queries/base';
import { ExtendedType, extendType } from 'src/utilities/extendType';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import data from 'src/utilities/types.json';
import { getTypeInfo } from 'src/utilities/typesHelpers';

import {
  BackupDrawer,
  addErrors,
  addTypeInfo,
  enhanceLinodes,
  getTotalPrice,
} from './BackupDrawer';
import { ExtendedLinode } from './types';

const queryClient = queryClientFactory();

const cachedTypesData = (data.data as LinodeType[]).map(
  extendType
) as ExtendedType[];

const linode1 = linodeFactory.build({
  backups: {
    enabled: true,
    last_successful: null,
    schedule: {
      day: 'Saturday',
      window: 'W2',
    },
  },
  specs: {
    disk: 20480,
    gpus: 0,
    memory: 1024,
    transfer: 1000,
    vcpus: 1,
  },
  type: 'g6-nanode-1',
});
const linode2 = linodeFactory.build({
  backups: {
    enabled: true,
    last_successful: null,
    schedule: {
      day: 'Scheduling',
      window: 'Scheduling',
    },
  },
  specs: {
    disk: 30720,
    gpus: 0,
    memory: 2048,
    transfer: 2000,
    vcpus: 1,
  },
  type: 'g6-standard-1',
});
const linode3 = linodeFactory.build({
  backups: {
    enabled: false,
    last_successful: null,
    schedule: {
      day: 'Scheduling',
      window: 'Scheduling',
    },
  },
  specs: {
    disk: 81920,
    gpus: 0,
    memory: 4096,
    transfer: 4000,
    vcpus: 2,
  },
  type: 'g6-standard-2',
});

const linodes = [linode1, linode3];

const error = {
  linodeId: linode1.id,
  reason: 'Error',
};

const linode1Type = getTypeInfo(linode1.type, cachedTypesData);
const linode2Type = getTypeInfo(linode2.type, cachedTypesData);

const extendedLinodes: ExtendedLinode[] = [
  { ...linode1, linodeError: error, typeInfo: linode1Type },
  { ...linode2, linodeError: error, typeInfo: linode2Type },
];

// Props for shallow rendering

const actions = {
  clearSidebar: jest.fn(),
  close: jest.fn(),
  dismissError: jest.fn(),
  dismissSuccess: jest.fn(),
  enable: jest.fn(),
  enroll: jest.fn(),
  getLinodesWithoutBackups: jest.fn(),
  toggle: jest.fn(),
};

const classes = { root: '' };

const props = {
  accountBackups: false,
  actions,
  autoEnroll: false,
  autoEnrollError: undefined,
  backupLoadError: '',
  backupsLoading: false,
  classes,
  enableErrors: [],
  enableSuccess: false,
  enabling: false,
  enrolling: false,
  linodeActions: { cloneLinode: jest.fn(), createLinode: jest.fn() },
  linodesData: [],
  linodesError: null,
  linodesLoading: false,
  linodesWithoutBackups: [],
  loading: false,
  open: true,
  requestedTypesData: cachedTypesData,
  setRequestedTypes: jest.fn(),
  typesLoading: false,
  updatedCount: 0,
};

const { findByTestId, getByTestId, queryByTestId, rerender } = render(
  wrapWithTheme(
    <BackupDrawer
      accountSettings={
        { data: accountSettingsFactory.build() } as UseQueryResult<
          AccountSettings,
          APIError[]
        >
      }
      closeSnackbar={jest.fn()}
      enqueueSnackbar={jest.fn()}
      queryClient={queryClient}
      {...props}
    />,
    { queryClient }
  )
);

describe('BackupDrawer component', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('adding type and error info to Linodes', () => {
    it('should add type info to a list of Linodes', () => {
      const withTypes = addTypeInfo(cachedTypesData, linodes);
      expect(withTypes[0].typeInfo).toHaveProperty(
        'formattedLabel',
        'Nanode 1 GB'
      );
      expect(withTypes[1].typeInfo).toHaveProperty(
        'formattedLabel',
        'Linode 4 GB'
      );
    });
    it('should attach an error to a Linode', () => {
      const withErrors = addErrors([error], linodes);
      expect(withErrors[0].linodeError).toHaveProperty('reason', 'Error');
      expect(withErrors[1].linodeError).toBeUndefined();
    });
    it('enhanceLinodes should attach typeInfo and linodeError', () => {
      const enhanced = enhanceLinodes({
        linodes: linodes,
        errors: [error],
        types: cachedTypesData,
      });
      expect(enhanced[0]).toHaveProperty('typeInfo');
      expect(enhanced[0]).toHaveProperty('linodeError');
    });
    it('should set typeInfo and linodeError to undefined if nothing matches', () => {
      expect(
        enhanceLinodes({
          linodes: linodes,
          errors: [],
          types: [],
        })
      ).toEqual([
        { ...linode1, linodeError: undefined, typeInfo: undefined },
        { ...linode3, linodeError: undefined, typeInfo: undefined },
      ]);
    });
  });
  describe('getTotalPrice function', () => {
    const price =
      (linode1Type?.addons.backups.price.monthly ?? 0) +
      (linode2Type?.addons.backups.price.monthly ?? 0);
    it('should return the total monthly backups price for all Linodes', () => {
      expect(getTotalPrice(extendedLinodes)).toEqual(price);
    });
    it('should ignore Linodes with undefined typeInfo or backup pricing', () => {
      extendedLinodes.push({
        ...linode3,
        linodeError: error,
        typeInfo: undefined,
      });
      expect(getTotalPrice(extendedLinodes)).toEqual(price);
    });
    it('should return 0 if no pricing information is passed in', () => {
      expect(getTotalPrice(linodes)).toEqual(0);
    });
  });
  describe('Backup Drawer', () => {
    it('should display an error Notice', () => {
      expect(queryByTestId('result-notice')).toBeNull();
      rerender(
        wrapWithTheme(
          <BackupDrawer
            closeSnackbar={jest.fn()}
            enqueueSnackbar={jest.fn()}
            {...props}
            accountSettings={
              { data: accountSettingsFactory.build() } as UseQueryResult<
                AccountSettings,
                APIError[]
              >
            }
            enableErrors={[error]}
            queryClient={queryClient}
          />,
          { queryClient }
        )
      );
      expect(getByTestId('result-notice')).toBeDefined();
    });
    it('should include the number of failures and successes in the Notice', () => {
      rerender(
        wrapWithTheme(
          <BackupDrawer
            closeSnackbar={jest.fn()}
            enqueueSnackbar={jest.fn()}
            {...props}
            accountSettings={
              { data: accountSettingsFactory.build() } as UseQueryResult<
                AccountSettings,
                APIError[]
              >
            }
            enableErrors={[error]}
            queryClient={queryClient}
            updatedCount={2}
          />,
          { queryClient }
        )
      );
      expect(getByTestId('result-notice')).toHaveTextContent('1 Linode failed');
      expect(getByTestId('result-notice')).toHaveTextContent('2 Linodes');
    });
    it('should call enrollAutoBackups on submit', async () => {
      rerender(
        wrapWithTheme(
          <BackupDrawer
            accountSettings={
              { data: accountSettingsFactory.build() } as UseQueryResult<
                AccountSettings,
                APIError[]
              >
            }
            closeSnackbar={jest.fn()}
            enqueueSnackbar={jest.fn()}
            queryClient={queryClient}
            {...props}
          />,
          { queryClient }
        )
      );
      const submit = await findByTestId('submit');
      fireEvent.click(submit);
      await waitFor(() => expect(actions.enroll).toHaveBeenCalled());
    });
    it('should close the drawer on Cancel', async () => {
      rerender(
        wrapWithTheme(
          <BackupDrawer
            accountSettings={
              { data: accountSettingsFactory.build() } as UseQueryResult<
                AccountSettings,
                APIError[]
              >
            }
            closeSnackbar={jest.fn()}
            enqueueSnackbar={jest.fn()}
            queryClient={queryClient}
            {...props}
          />,
          { queryClient }
        )
      );
      const cancelButton = await findByTestId('cancel');
      fireEvent.click(cancelButton);
      await waitFor(() => expect(actions.close).toHaveBeenCalled());
    });
  });
});
