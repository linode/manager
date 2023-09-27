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
  it('should contain the name of the cert in the drawer title and label field', () => {
    const onClose = jest.fn();

    const { getByTestId, getByLabelText } = renderWithTheme(
      <EditCertificateDrawer
        certificate={mockTLSCertificate}
        loadbalancerId={0}
        onClose={onClose}
        open
      />
    );

    const labelInput = getByLabelText('Certificate Label');

    expect(getByTestId('drawer-title')).toHaveTextContent(
      `Edit ${mockTLSCertificate.label}`
    );
    expect(labelInput).toHaveDisplayValue(mockTLSCertificate.label);
  });

  it('should submit and close drawer when only the label of the certificate is edited', async () => {
    const onClose = jest.fn();

    const { getByLabelText, getByTestId } = renderWithTheme(
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
    expect(certInput).toHaveDisplayValue('');

    act(() => {
      userEvent.type(labelInput, 'my-updated-cert-0');
      userEvent.click(getByTestId('submit'));
    });

    await waitFor(() => expect(onClose).toBeCalled());
  });

  it('should submit and close drawer when both a certificate and key are included', async () => {
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
