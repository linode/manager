import * as React from 'react';

import { eventFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationCenterEvent } from './NotificationCenterEvent';

describe('NotificationCenterEvent', () => {
  it('should render a finished event with the proper data', () => {
    const event = eventFactory.build({
      action: 'linode_create',
      entity: {
        id: 123,
        label: 'test-linode',
      },
      status: 'finished',
    });

    const { getByTestId, getByText } = renderWithTheme(
      <NotificationCenterEvent event={event} onClose={() => vi.fn()} />
    );

    expect(
      getByTestId('linode_create').textContent?.match(
        /Linode test-linode has been created./
      )
    );
    expect(
      getByText(/Started 1 second ago | prod-test-001/)
    ).toBeInTheDocument();
  });

  it('should redner an in progress event with the proper data', () => {
    const event = eventFactory.build({
      action: 'linode_create',
      entity: {
        id: 123,
        label: 'test-linode',
      },
      percent_complete: 50,
      status: 'started',
    });

    const { getByTestId, getByText } = renderWithTheme(
      <NotificationCenterEvent event={event} onClose={() => vi.fn()} />
    );

    expect(
      getByTestId('linode_create').textContent?.match(
        /Linode test-linode is being created./
      )
    );
    expect(
      getByText(/Started 1 second ago | prod-test-001/)
    ).toBeInTheDocument();
    expect(getByTestId('linear-progress')).toHaveAttribute(
      'aria-valuenow',
      '50'
    );
  });
});
