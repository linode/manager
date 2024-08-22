import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { profileFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { queryClientFactory } from 'src/queries/base';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TimezoneForm, formatOffset } from './TimezoneForm';

const queryClient = queryClientFactory();

describe('Timezone change form', () => {
  // Use the MSW to mock a profile with America/New_York as the timezone
  // for this specific suite of tests
  server.use(
    http.get('*/profile', () => {
      return HttpResponse.json(
        profileFactory.build({ timezone: 'America/New_York' })
      );
    })
  );

  it('should render input label', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <TimezoneForm loggedInAsCustomer={true} />,
      { queryClient }
    );

    // This component depends on the /profile to be loaded. Wait for
    // loading to finish before we check anything.
    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    expect(getByText('Timezone')).toBeInTheDocument();
  });

  it('should show a message if an admin is logged in as a customer', () => {
    const { getByTestId } = renderWithTheme(
      <TimezoneForm loggedInAsCustomer={true} />,
      { queryClient }
    );

    expect(getByTestId('admin-notice')).toBeInTheDocument();
  });

  it('should not show a message if the user is logged in normally', () => {
    const { queryByTestId } = renderWithTheme(
      <TimezoneForm loggedInAsCustomer={false} />,
      { queryClient }
    );

    expect(queryByTestId('admin-notice')).not.toBeInTheDocument();
  });

  it("should include text with the user's current time zone", async () => {
    const { getByText } = renderWithTheme(
      <TimezoneForm loggedInAsCustomer={true} />,
      { queryClient }
    );

    expect(getByText('New York', { exact: false })).toBeInTheDocument();
    expect(getByText('Eastern Time', { exact: false })).toBeInTheDocument();
  });
});

describe('formatOffset', () => {
  it('formats the offset correctly', () => {
    const testMap = [
      {
        expectedOffset: '+0:00',
        timezone: {
          label: 'Coordinated Universal Time',
          name: 'UTC',
          offset: 0,
        },
      },
    ];

    testMap.forEach(({ expectedOffset, timezone }) =>
      expect(formatOffset(timezone)).toBe(
        `(GMT ${expectedOffset}) ${timezone.label}`
      )
    );
  });
});
