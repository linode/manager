import { linodeFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeSettingsLabelPanel } from './LinodeSettingsLabelPanel';

describe('LinodeSettingsLabelPanel', () => {
  it('should render and the linode label', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({ id: 1, label: 'my-linode-1' })
        );
      })
    );

    const { getByLabelText, getByText } = renderWithTheme(
      <LinodeSettingsLabelPanel linodeId={1} />
    );

    // Check for Header
    expect(getByText('Linode Label')).toBeVisible();

    const input = getByLabelText('Label');
    const button = getByText('Save').closest('button');

    await waitFor(() => {
      // Verify the input contains the Linode's label when it loads it
      expect(input).toHaveValue('my-linode-1');
    });

    // Verify that the save button is disabled (because the label is unmodified)
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable the input if the `isReadOnly` prop is true', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({ id: 1, label: 'my-linode-1' })
        );
      })
    );

    const { getByLabelText } = renderWithTheme(
      <LinodeSettingsLabelPanel isReadOnly linodeId={1} />
    );

    const input = getByLabelText('Label');

    expect(input).toBeDisabled();
  });
});
