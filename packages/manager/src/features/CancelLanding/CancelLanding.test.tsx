import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CancelLanding } from './CancelLanding';

describe('CancelLanding', () => {
  const options = {
    initialEntries: ['/cancel?survey_link=https://linode.com/fake-survey'],
    initialRoute: '/cancel',
  };

  it("renders text explaining that the user's account is closed", () => {
    const { getByText } = renderWithTheme(<CancelLanding />, options);

    expect(
      getByText('Your account is closed.', { exact: false })
    ).toBeVisible();
  });

  it('renders text asking the user to complete a survey', () => {
    const { getByText } = renderWithTheme(<CancelLanding />, options);

    expect(
      getByText('Would you mind taking a brief survey?', { exact: false })
    ).toBeVisible();
  });

  it('renders a link to the survey', () => {
    const { getByRole } = renderWithTheme(<CancelLanding />, options);

    const link = getByRole('link');

    expect(link).toBeVisible();
    expect(link).toHaveTextContent('Take our exit survey');
    expect(link).toHaveAttribute('href', 'https://linode.com/fake-survey');
  });
});
