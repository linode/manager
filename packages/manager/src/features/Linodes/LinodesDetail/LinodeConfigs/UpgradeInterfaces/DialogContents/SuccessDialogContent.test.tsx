import { linodeInterfaceFactoryVPC } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SUCCESS_DRY_RUN_COPY, SUCCESS_UPGRADE_COPY } from '../constants';
import { SuccessDialogContent } from './SuccessDialogContent';

import type {
  SuccessDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

const props = {
  linodeId: 1,
  onClose: vi.fn(),
  open: true,
  setDialogState: vi.fn(),
  state: {
    dialogTitle: 'Upgrade Dry Run',
    isDryRun: true,
    linodeInterfaces: [linodeInterfaceFactoryVPC.build()],
    step: 'success',
  },
} as UpgradeInterfacesDialogContentProps<SuccessDialogState>;

describe('SuccessDialogContent', () => {
  it('can render the success content for a dry run', () => {
    const { getByText } = renderWithTheme(<SuccessDialogContent {...props} />);

    getByText('Return to Upgrade Overview');
    getByText('Continue to Upgrade');
    getByText('Upgrade Summary');
    getByText(SUCCESS_DRY_RUN_COPY);
    getByText('Cancel');
  });

  it('can render the success content for the actual upgrade', () => {
    const { getByText } = renderWithTheme(
      <SuccessDialogContent
        {...props}
        state={{
          ...props.state,
          isDryRun: false,
        }}
      />
    );

    getByText(SUCCESS_UPGRADE_COPY);
    getByText('Close');
    getByText('Upgrade Summary');
    getByText('Interface Meta Info: Interface #1');
    getByText('VPC Interface Details');
  });

  it('can close the dialog', async () => {
    const { getByText } = renderWithTheme(<SuccessDialogContent {...props} />);

    const cancelButton = getByText('Cancel');
    await userEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
