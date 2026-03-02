import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CancelLanding } from './CancelLanding';

const realLocation = window.location;

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
  };
});

afterEach(() => {
  (window as Partial<Window>).location = realLocation;
});

describe('CancelLanding', () => {
  it('does not render the body when there is no survey_link in the state', () => {
    queryMocks.useLocation.mockReturnValue({
      state: {},
    });
    const { queryByTestId } = renderWithTheme(<CancelLanding />, {
      initialEntries: ['/cancel'],
      initialRoute: '/cancel',
    });
    expect(queryByTestId('body')).toBe(null);
  });

  it('renders the body when there is a survey_link in the state', () => {
    queryMocks.useLocation.mockReturnValue({
      state: { surveyLink: 'https://linode.com' },
    });
    const { queryByTestId } = renderWithTheme(<CancelLanding />, {
      initialEntries: ['/cancel'],
      initialRoute: '/cancel',
    });
    expect(queryByTestId('body')).toBeInTheDocument();
  });

  it('navigates to the survey link when the button is clicked', () => {
    // Mock window.location.assign.
    // See this blog post: https://remarkablemark.org/blog/2018/11/17/mock-window-location/
    const mockAssign = vi.fn();
    delete (window as Partial<Window>).location;

    (window as Partial<Window>).location = {
      ...realLocation,
      assign: mockAssign,
    };

    const surveyLink = 'https://linode.com';
    queryMocks.useLocation.mockReturnValue({
      state: { surveyLink },
    });
    const { getByTestId } = renderWithTheme(<CancelLanding />, {
      initialEntries: ['/cancel'],
      initialRoute: '/cancel',
    });
    const button = getByTestId('survey-button');
    fireEvent.click(button);
    expect(mockAssign).toHaveBeenCalledWith(surveyLink);
  });
});
