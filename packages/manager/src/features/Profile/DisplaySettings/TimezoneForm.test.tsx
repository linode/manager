import * as React from 'react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import { profileFactory } from 'src/factories';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { formatOffset, TimezoneForm } from './TimezoneForm';

describe('Timezone change form', () => {
  // Use the MSW to mock a profile with America/New_York as the timezone
  // for this specific suite of tests
  server.use(
    rest.get('*/profile', (req, res, ctx) => {
      return res(
        ctx.json(profileFactory.build({ timezone: 'America/New_York' }))
      );
    })
  );

  it('should render input label', async () => {
    const { getByText, getByTestId } = renderWithTheme(
      <TimezoneForm loggedInAsCustomer={true} />
    );

    // This component depends on the /profile to be loaded. Wait for
    // loading to finish before we check anything.
    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    expect(getByText('Timezone')).toBeInTheDocument();
  });

  it('should show a message if an admin is logged in as a customer', () => {
    const { getByTestId } = renderWithTheme(
      <TimezoneForm loggedInAsCustomer={true} />
    );

    expect(getByTestId('admin-notice')).toBeInTheDocument();
  });

  it('should not show a message if the user is logged in normally', () => {
    const { queryByTestId } = renderWithTheme(
      <TimezoneForm loggedInAsCustomer={false} />
    );

    expect(queryByTestId('admin-notice')).not.toBeInTheDocument();
  });

  it("should include text with the user's current time zone", async () => {
    const { getByText } = renderWithTheme(
      <TimezoneForm loggedInAsCustomer={true} />
    );

    expect(getByText('New York', { exact: false })).toBeInTheDocument();
    expect(getByText('Eastern Time', { exact: false })).toBeInTheDocument();
  });
});

describe('formatOffset', () => {
  it('formats the offset correctly', () => {
    const testMap = [
      {
        timezone: {
          label: 'Coordinated Universal Time',
          name: 'UTC',
          offset: 0,
        },
        expectedOffset: '+0:00',
      },
    ];

    testMap.forEach(({ timezone, expectedOffset }) =>
      expect(formatOffset(timezone)).toBe(
        `(GMT ${expectedOffset}) ${timezone.label}`
      )
    );
  });
});
