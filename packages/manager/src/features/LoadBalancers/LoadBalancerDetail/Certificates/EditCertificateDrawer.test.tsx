import { Certificate } from '@linode/api-v4';
import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditCertificateDrawer } from './EditCertificateDrawer';

const mockTLSCertificate: Certificate = {
  id: 0,
  label: 'test-tls-cert',
  type: 'downstream',
};
const mockCACertificate: Certificate = {
  id: 0,
  label: 'test-ca-cert',
  type: 'ca',
};

describe('EditCertificateDrawer', () => {
  it('should contain the name of the cert in the drawer title', () => {
    const onClose = jest.fn();

    const { getByTestId } = renderWithTheme(
      <EditCertificateDrawer
        certificate={mockTLSCertificate}
        loadbalancerId={0}
        onClose={onClose}
        open
      />
    );

    expect(getByTestId('drawer-title')).toHaveTextContent(
      `Edit ${mockTLSCertificate.label}`
    );
  });

  it('should display pre-populated fields for a TLS cert type when opened', async () => {
    const onClose = jest.fn();

    const { getByLabelText } = renderWithTheme(
      <EditCertificateDrawer
        certificate={mockTLSCertificate}
        loadbalancerId={0}
        onClose={onClose}
        open
      />
    );

    const labelInput = getByLabelText('Certificate Label');
    const certInput = getByLabelText('TLS Certificate');
    const keyInput = getByLabelText('Private Key');

    expect(labelInput).toHaveDisplayValue(mockTLSCertificate.label);
    expect(certInput).not.toHaveDisplayValue('');
    expect(keyInput).not.toHaveDisplayValue('');
  });

  it.skip('should display pre-populated fields for a CA cert type when opened', async () => {
    const onClose = jest.fn();

    const { getByLabelText } = renderWithTheme(
      <EditCertificateDrawer
        certificate={mockCACertificate}
        loadbalancerId={0}
        onClose={onClose}
        open
      />
    );

    const labelInput = getByLabelText('Certificate Label');
    const certInput = getByLabelText('Server Certificate');

    expect(labelInput).toHaveDisplayValue(mockCACertificate.label);
    expect(certInput).not.toHaveDisplayValue('');
  });

  it.skip('should have editable fields and be submittable when filled out correctly', async () => {
    const onClose = jest.fn();

    const { getByLabelText, getByTestId } = renderWithTheme(
      <EditCertificateDrawer
        certificate={mockTLSCertificate}
        loadbalancerId={0}
        onClose={onClose}
        open
      />
    );
    const labelInput = getByLabelText('Certificate Label');
    const certInput = getByLabelText('TLS Certificate');
    const keyInput = getByLabelText('Private Key');

    act(() => {
      userEvent.type(labelInput, 'my-cert-0');
      userEvent.type(certInput, 'massive cert');
      userEvent.type(keyInput, 'massive key');

      userEvent.click(getByTestId('submit'));
    });

    await waitFor(() => expect(onClose).toBeCalled());
  });
});
