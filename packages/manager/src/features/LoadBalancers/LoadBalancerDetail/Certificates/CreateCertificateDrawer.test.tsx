import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateCertificateDrawer } from './CreateCertificateDrawer';

describe('CreateCertificateDrawer', () => {
  it(
    'should be submittable when form is filled out correctly',
    async () => {
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

      await userEvent.type(labelInput, 'my-cert-0');
      await userEvent.type(certInput, 'massive cert');
      await userEvent.type(keyInput, 'massive key');

      await userEvent.click(getByTestId('submit'));

      await waitFor(() => expect(onClose).toBeCalled());
    },
    { timeout: 10000 }
  );
});
