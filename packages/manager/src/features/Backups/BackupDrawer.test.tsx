import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { LinodeType } from '@linode/api-v4/lib/linodes';
import data from 'src/utilities/types.json';
import { linodeFactory } from 'src/factories/linodes';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { getTypeInfo } from 'src/utilities/typesHelpers';

import {
  addErrors,
  addTypeInfo,
  BackupDrawer,
  enhanceLinodes,
  getTotalPrice,
} from './BackupDrawer';
import { ExtendedLinode } from './types';

const cachedTypesData = data.data as LinodeType[];

const linode1 = linodeFactory.build({
  specs: {
    transfer: 1000,
    memory: 1024,
    vcpus: 1,
    disk: 20480,
    gpus: 0,
  },
  type: 'g6-nanode-1',
  backups: {
    schedule: {
      window: 'W2',
      day: 'Saturday',
    },
    enabled: true,
    last_successful: null,
  },
});
const linode2 = linodeFactory.build({
  specs: {
    transfer: 2000,
    memory: 2048,
    vcpus: 1,
    disk: 30720,
    gpus: 0,
  },
  type: 'g6-standard-1',
  backups: {
    schedule: {
      window: 'Scheduling',
      day: 'Scheduling',
    },
    enabled: true,
    last_successful: null,
  },
});
const linode3 = linodeFactory.build({
  specs: {
    transfer: 4000,
    memory: 4096,
    vcpus: 2,
    disk: 81920,
    gpus: 0,
  },
  type: 'g6-standard-2',
  backups: {
    schedule: {
      window: 'Scheduling',
      day: 'Scheduling',
    },
    enabled: false,
    last_successful: null,
  },
});

const linodes = [linode1, linode3];

const error = {
  linodeId: linode1.id,
  reason: 'Error',
};

const linode1Type = getTypeInfo(linode1.type, cachedTypesData);
const linode2Type = getTypeInfo(linode2.type, cachedTypesData);

const extendedLinodes: ExtendedLinode[] = [
  { ...linode1, typeInfo: linode1Type, linodeError: error },
  { ...linode2, typeInfo: linode2Type, linodeError: error },
];

// Props for shallow rendering

const actions = {
  enable: jest.fn(),
  getLinodesWithoutBackups: jest.fn(),
  close: jest.fn(),
  dismissError: jest.fn(),
  dismissSuccess: jest.fn(),
  clearSidebar: jest.fn(),
  enroll: jest.fn(),
  toggle: jest.fn(),
};

const classes = { root: '' };

const props = {
  accountBackups: false,
  actions,
  classes,
  open: true,
  loading: false,
  enabling: false,
  backupLoadError: '',
  linodesWithoutBackups: [],
  backupsLoading: false,
  enableSuccess: false,
  enableErrors: [],
  typesLoading: false,
  typesData: cachedTypesData,
  enrolling: false,
  autoEnroll: false,
  autoEnrollError: undefined,
  updatedCount: 0,
};

const { rerender, getByTestId, findByTestId, queryByTestId } = render(
  wrapWithTheme(
    <BackupDrawer
      closeSnackbar={jest.fn()}
      enqueueSnackbar={jest.fn()}
      {...props}
    />
  )
);

describe('BackupDrawer component', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('adding type and error info to Linodes', () => {
    it('should add type info to a list of Linodes', () => {
      const withTypes = addTypeInfo(cachedTypesData, linodes);
      expect(withTypes[0].typeInfo).toHaveProperty('label', 'Nanode 1GB');
      expect(withTypes[1].typeInfo).toHaveProperty('label', 'Linode 4GB');
    });
    it('should attach an error to a Linode', () => {
      const withErrors = addErrors([error], linodes);
      expect(withErrors[0].linodeError).toHaveProperty('reason', 'Error');
      expect(withErrors[1].linodeError).toBeUndefined();
    });
    it('enhanceLinodes should attach typeInfo and linodeError', () => {
      const enhanced = enhanceLinodes(linodes, [error], cachedTypesData);
      expect(enhanced[0]).toHaveProperty('typeInfo');
      expect(enhanced[0]).toHaveProperty('linodeError');
    });
    it('should set typeInfo and linodeError to undefined if nothing matches', () => {
      expect(enhanceLinodes(linodes, [], [])).toEqual([
        { ...linode1, typeInfo: undefined, linodeError: undefined },
        { ...linode3, typeInfo: undefined, linodeError: undefined },
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
        typeInfo: undefined,
        linodeError: error,
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
            enableErrors={[error]}
          />
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
            enableErrors={[error]}
            updatedCount={2}
          />
        )
      );
      expect(getByTestId('result-notice')).toHaveTextContent('1 Linode failed');
      expect(getByTestId('result-notice')).toHaveTextContent('2 Linodes');
    });
    it('should call enrollAutoBackups on submit', async () => {
      rerender(
        wrapWithTheme(
          <BackupDrawer
            closeSnackbar={jest.fn()}
            enqueueSnackbar={jest.fn()}
            {...props}
          />
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
            closeSnackbar={jest.fn()}
            enqueueSnackbar={jest.fn()}
            {...props}
          />
        )
      );
      const cancelButton = await findByTestId('cancel');
      fireEvent.click(cancelButton);
      await waitFor(() => expect(actions.close).toHaveBeenCalled());
    });
  });
});
