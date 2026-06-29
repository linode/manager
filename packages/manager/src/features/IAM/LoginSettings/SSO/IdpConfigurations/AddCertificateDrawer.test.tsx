import { toast } from '@akamai/cds-components/notification-toast';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  changeCdsTextArea,
  expectNotificationBannerText,
  getCdsButtonByText,
} from '../../../utilities/testHelpers';
import { renderWithProviders } from '../../../utilities/testHelpers';
import { AddCertificateDrawer } from './AddCertificateDrawer';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}));

vi.mock('@akamai/cds-components/notification-toast', () => ({
  toast: {
    open: vi.fn(),
  },
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');

  return {
    ...actual,
    useCreateIdpCertificateMutation: vi.fn(() => ({
      mutateAsync: mocks.mutateAsync,
    })),
  };
});

const getTextArea = () =>
  // eslint-disable-next-line testing-library/no-node-access
  document.body.querySelector('cds-text-area') as HTMLElement | null;

const changeTextAreaValue = async (value: string) => {
  const host = getTextArea();
  if (!host) throw new Error('cds-text-area host not found');

  await changeCdsTextArea(host, value);
};

const clickAddCertificateButton = async () => {
  await waitFor(async () => {
    const addButton = await getCdsButtonByText(
      document.body,
      'Add Certificate'
    );

    expect(addButton).toBeEnabled();
  });

  const addButton = await getCdsButtonByText(document.body, 'Add Certificate');
  await userEvent.click(addButton as HTMLElement);
};

describe('AddCertificateDrawer', () => {
  const onClose = vi.fn();

  const props = {
    idpConfigId: 'test-idp-config-id',
    onClose,
    open: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutateAsync.mockResolvedValue({});
  });

  it('renders drawer content', () => {
    renderWithProviders(<AddCertificateDrawer {...props} />);

    expect(screen.getByTestId('drawer')).toBeVisible();
    expect(
      screen.getByText('Enter a SAML certificate for the IDP configuration.')
    ).toBeVisible();
    expect(screen.getByText('SAML Public Certificate')).toBeVisible();
    expect(getTextArea()).toBeInTheDocument();
  });

  it('creates certificate and closes drawer on successful submit', async () => {
    renderWithProviders(<AddCertificateDrawer {...props} />);

    // wait for cds-text-area host to be present before dispatching change
    await waitFor(() => {
      expect(getTextArea()).toBeInTheDocument();
    });

    await changeTextAreaValue('test-certificate');
    await clickAddCertificateButton();

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        certificate: 'test-certificate',
      });
    });

    await waitFor(() => {
      expect(vi.mocked(toast.open)).toHaveBeenCalledWith({
        text: 'Certificate added successfully.',
        type: 'success',
      });
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('renders API error banner when create certificate request fails', async () => {
    mocks.mutateAsync.mockRejectedValue([
      {
        reason: 'Certificate is not valid.',
      },
    ]);

    renderWithProviders(<AddCertificateDrawer {...props} />);

    // wait for cds-text-area host to be present
    await waitFor(() => {
      expect(getTextArea()).toBeInTheDocument();
    });

    await changeTextAreaValue('invalid-cert');
    await clickAddCertificateButton();

    // Error from API is surfaced in a notification banner
    await expectNotificationBannerText('Certificate is not valid.');
    expect(onClose).not.toHaveBeenCalled();
  });
});
