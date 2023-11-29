import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateCertificateDrawer } from './CreateCertificateDrawer';

describe('CreateCertificateDrawer', () => {
  it('should be submittable when form is filled out correctly', async () => {
    const onClose = vi.fn();

    const { getByLabelText, getByTestId } = renderWithTheme(
      <CreateCertificateDrawer
        loadbalancerId={0}
        onClose={onClose}
        open
        type="downstream"
      />
    );

    const labelInput = getByLabelText('Label');
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
