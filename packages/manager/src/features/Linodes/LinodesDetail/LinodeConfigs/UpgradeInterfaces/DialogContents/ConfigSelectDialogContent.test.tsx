import userEvent from '@testing-library/user-event';
import React from 'react';

import { linodeConfigFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ConfigSelectDialogContent } from './ConfigSelectDialogContent';

import type {
  ConfigSelectDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

const props = {
  linodeId: 1,
  onClose: vi.fn(),
  open: true,
  setDialogState: vi.fn(),
  state: {
    configs: linodeConfigFactory.buildList(2),
    dialogTitle: 'Upgrade Dry Run',
    isDryRun: true,
    step: 'configSelect',
  },
} as UpgradeInterfacesDialogContentProps<ConfigSelectDialogState>;

describe('ConfigSelectDialogContent', () => {
  it('can render the config select content for a dry run', () => {
    const { getByText } = renderWithTheme(
      <ConfigSelectDialogContent {...props} />
    );

    getByText('Perform Dry Run');
    getByText(
      /This Linode has multiple configuration profiles. Choose one to continue./
    );
    getByText('Cancel');
    getByText('Configuration Profile');
  });

  it('can render the config select content for the actual upgrade', () => {
    const { getByText } = renderWithTheme(
      <ConfigSelectDialogContent
        {...props}
        state={{
          ...props.state,
          dialogTitle: 'Upgrade Interfaces',
          isDryRun: false,
        }}
      />
    );

    getByText('Upgrade Interfaces');
    getByText(
      /This Linode has multiple configuration profiles. Choose one to continue./
    );
    getByText('Cancel');
    getByText('Configuration Profile');
  });

  it('can close the dialog', async () => {
    const { getByText } = renderWithTheme(
      <ConfigSelectDialogContent {...props} />
    );

    const cancelButton = getByText('Cancel');
    await userEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
