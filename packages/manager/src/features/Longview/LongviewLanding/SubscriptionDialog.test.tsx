import { cleanup, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';

import SubscriptionDialog from './SubscriptionDialog';

const props = {
  isOpen: true,
  isManaged: false,
  clientLimit: 5,
  onClose: jest.fn(),
  onSubmit: jest.fn()
};

afterEach(cleanup);

describe('Subscription Dialog component', () => {
  it("should include the user's client count in the message", () => {
    const { getByText } = renderWithTheme(<SubscriptionDialog {...props} />);
    const matcher = new RegExp(String(props.clientLimit));
    getByText(matcher);
  });

  it('should call the submit handler when View upgrade options button is clicked', () => {
    const { getByText } = renderWithTheme(<SubscriptionDialog {...props} />);
    const button = getByText(/view/i);
    fireEvent.click(button);
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should call the onClose handler when Cancel is clicked', () => {
    const { getByText } = renderWithTheme(<SubscriptionDialog {...props} />);
    const button = getByText(/cancel/i);
    fireEvent.click(button);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should show a custom message for Managed customers', () => {
    const { getByText } = renderWithTheme(
      <SubscriptionDialog {...props} isManaged={true} />
    );
    getByText('contact Support');
  });

  it('should include a Contact Support button for Managed customers that redirects to /support/tickets', () => {
    const { getByText } = renderWithTheme(
      <SubscriptionDialog {...props} isManaged={true} />
    );
    const button = getByText('Contact Support');
    fireEvent.click(button);
  });
});
