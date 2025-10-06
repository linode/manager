import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CancelLanding } from './CancelLanding';

const realLocation = window.location;

beforeAll(() => {
  window.location = realLocation;
});

afterEach(() => {
  window.location = realLocation;
});

describe('CancelLanding', () => {
  it('does not render the body when there is no survey_link in the state', () => {
    const { queryByTestId } = renderWithTheme(<CancelLanding />, {
      initialEntries: ['/cancel'],
      initialRoute: '/cancel',
    });
    expect(queryByTestId('body')).toBe(null);
  });

  it('renders the body when there is a survey_link in the state', () => {
    const { queryByTestId } = renderWithTheme(<CancelLanding />, {
      initialEntries: ['/cancel?survey_link=https://linode.com'],
      initialRoute: '/cancel',
    });
    expect(queryByTestId('body')).toBeInTheDocument();
  });

  it('navigates to the survey link when the button is clicked', () => {
    // Mock window.location.assign.
    // See this blog post: https://remarkablemark.org/blog/2018/11/17/mock-window-location/
    const mockAssign = vi.fn();
    delete (window as Partial<Window>).location;

    window.location = { ...realLocation, assign: mockAssign };

    const surveyLink = 'https://linode.com';
    const { getByTestId } = renderWithTheme(<CancelLanding />, {
      initialEntries: ['/cancel?survey_link=' + encodeURIComponent(surveyLink)],
      initialRoute: '/cancel',
    });
    const button = getByTestId('survey-button');
    fireEvent.click(button);
    expect(mockAssign).toHaveBeenCalledWith(surveyLink);
  });
});
