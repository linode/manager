import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ERROR_DRY_RUN_COPY } from '../constants';
import { ErrorDialogContent } from './ErrorDialogContent';

import type {
  ErrorDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

const errorMessage1 = 'example error 1';

const props = {
  linodeId: 1,
  onClose: vi.fn(),
  open: true,
  setDialogState: vi.fn(),
  state: {
    dialogTitle: 'Error Dialog Example',
    errors: [{ reason: errorMessage1 }, { reason: 'example error 2' }],
    isDryRun: true,
    step: 'error',
  },
} as UpgradeInterfacesDialogContentProps<ErrorDialogState>;

describe('ErrorDialogContent', () => {
  it('can render the error content for a dry run', () => {
    const { getByText } = renderWithTheme(<ErrorDialogContent {...props} />);

    getByText(ERROR_DRY_RUN_COPY);
    getByText(errorMessage1);
    getByText('example error 2');
    getByText('Close');
  });

  it('can render the error content for an actual upgrade', () => {
    const { getByText, queryByText } = renderWithTheme(
      <ErrorDialogContent
        {...props}
        state={{
          ...props.state,
          isDryRun: false,
        }}
      />
    );

    expect(queryByText(ERROR_DRY_RUN_COPY)).not.toBeInTheDocument();
    getByText(errorMessage1);
    getByText('Close');
  });

  it('can close the dialog', async () => {
    const { getByText } = renderWithTheme(<ErrorDialogContent {...props} />);

    const cancelButton = getByText('Close');
    await userEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
