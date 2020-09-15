import { screen } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { AccessKeyDrawer, MODES, Props } from './AccessKeyDrawer';

describe('AccessKeyDrawer', () => {
  const props: Props = {
    open: true,
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    mode: 'creating' as MODES,
    isRestrictedUser: false
  };
  renderWithTheme(<AccessKeyDrawer {...props} />);
  it('renders without crashing', () => {
    expect(screen.getByText(/create an access key/i)).toBeInTheDocument();
  });
});
