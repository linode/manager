import { Typography } from '@linode/ui';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseTooltip } from './CloudPulseTooltip';

describe('Cloud Pulse Tooltip Component Tests', () => {
  it('renders the tooltip', async () => {
    const screen = renderWithTheme(
      <CloudPulseTooltip placement="top-start" title="Test">
        <Typography variant="h2">Test</Typography>
      </CloudPulseTooltip>
    );

    expect(
      await screen.container.querySelector('[data-qa-tooltip="Test"]')
    ).toBeInTheDocument();
  });
});
