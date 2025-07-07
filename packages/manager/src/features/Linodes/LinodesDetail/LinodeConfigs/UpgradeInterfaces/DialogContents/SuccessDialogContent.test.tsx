import { linodeInterfaceFactoryVPC } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

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

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
    useLocation: queryMocks.useLocation,
  };
});

describe('SuccessDialogContent', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({
      linodeId: props.linodeId,
    });
  });

  it('can render the success content for a dry run', () => {
    const { getByText } = renderWithTheme(<SuccessDialogContent {...props} />);

    getByText('Return to Overview');
    getByText('Continue to Upgrade');
    getByText('Dry Run Summary');
    getByText(/Dry run successful/);
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

    getByText(/Upgrade successful/);
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
