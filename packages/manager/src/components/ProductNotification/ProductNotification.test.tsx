import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  ProductNotification,
  ProductNotificationProps,
} from './ProductNotification';

describe('ProductNotification', () => {
  test('renders a notice with the correct severity level and text', () => {
    const props: ProductNotificationProps = {
      severity: 'critical',
      text: 'This is a critical notification',
    };

    const { getByText } = renderWithTheme(<ProductNotification {...props} />);

    const noticeElement = getByText('This is a critical notification');
    expect(noticeElement).toBeInTheDocument();
  });
});
