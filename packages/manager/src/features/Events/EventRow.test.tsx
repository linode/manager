import * as React from 'react';

import { eventFactory } from 'src/factories';
import {
  renderWithTheme,
  resizeScreenSize,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { EventRow } from './EventRow';

import type { Event } from '@linode/api-v4/lib/account';

describe('EventRow', () => {
  const mockEvent: Event = eventFactory.build({
    action: 'tfa_enabled',
    status: 'notification',
    username: 'test_user',
  });

  it('displays the correct data', () => {
    resizeScreenSize(1600);
    const { getByRole } = renderWithTheme(
      wrapWithTableBody(<EventRow event={mockEvent} />)
    );

    expect(
      getByRole('cell', {
        name: /Two-factor authentication has been enabled./i,
      })
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: /test_user/i })).toBeInTheDocument();
  });
});
