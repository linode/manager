import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { LinodeSettingsLabelPanel } from './LinodeSettingsLabelPanel';
import { rest, server } from 'src/mocks/testServer';
import { linodeFactory } from 'src/factories';
import { waitFor } from '@testing-library/react';

describe('LinodeSettingsLabelPanel', () => {
  it('should render and the linode label', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, label: 'my-linode-1' }))
        );
      })
    );

    const { getByText, getByLabelText } = renderWithTheme(
      <LinodeSettingsLabelPanel linodeId={1} />
    );

    // Check for Header
    expect(getByText('Linode Label')).toBeVisible();

    const input = getByLabelText('Label');

    await waitFor(() => {
      // Verify the input contains the Linode's label when it loads it
      expect(input).toHaveAttribute('value', 'my-linode-1');
    });
  });
});
