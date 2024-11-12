import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { profileFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TimezoneForm, getOptionLabel } from './TimezoneForm';

describe('Timezone change form', () => {
  beforeEach(() => {
    // Use the MSW to mock a profile with America/New_York as the timezone
    // for this specific suite of tests
    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(
          profileFactory.build({ timezone: 'America/New_York' })
        );
      })
    );
  });

  it('should render input label', () => {
    const { getByText } = renderWithTheme(<TimezoneForm />);

    expect(getByText('Timezone')).toBeInTheDocument();
  });

  it('should show a message if an admin is logged in as a customer', async () => {
    const { getByTestId } = renderWithTheme(<TimezoneForm />, {
      customStore: { authentication: { loggedInAsCustomer: true } },
    });

    expect(getByTestId('admin-notice')).toBeInTheDocument();
  });

  it('should not show a message if the user is logged in normally', async () => {
    const { queryByTestId } = renderWithTheme(<TimezoneForm />);

    expect(queryByTestId('admin-notice')).not.toBeInTheDocument();
  });

  it("should include text with the user's current time zone in the admin warning", async () => {
    const { queryByTestId } = renderWithTheme(<TimezoneForm />, {
      customStore: { authentication: { loggedInAsCustomer: true } },
    });

    await waitFor(() => {
      expect(queryByTestId('admin-notice')).toHaveTextContent(
        'America/New_York'
      );
    });
  });

  it("should show the user's currently selected timezone", async () => {
    const { getByLabelText } = renderWithTheme(<TimezoneForm />);

    await waitFor(() => {
      expect(getByLabelText('Timezone')).toHaveDisplayValue(
        /Eastern Time - New York/
      );
    });
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
      expect(getOptionLabel(timezone)).toBe(
        `(GMT ${expectedOffset}) ${timezone.label}`
      )
    );
  });
});
