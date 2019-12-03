import { cleanup } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';
import CheckDomainDrawer, { Props } from './CheckDomainDrawer';

const props: Props = {
  domainLabel: 'test-domain',
  isOpen: true,
  onClose: jest.fn()
};

afterEach(cleanup);

describe('CheckDomainDrawer', () => {
  it('should render when open', () => {
    const { getByText } = renderWithTheme(<CheckDomainDrawer {...props} />);
    getByText(/check domain status/i);
  });

  it('should render a domain-specific command', () => {
    const { getByTestId } = renderWithTheme(<CheckDomainDrawer {...props} />);
    expect(getByTestId('dig command')).toHaveTextContent(props.domainLabel);
  });
});
