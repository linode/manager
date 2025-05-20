import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ProductNotification } from './ProductNotification';

import type { ProductNotificationProps } from './ProductNotification';

describe('ProductNotification', () => {
  test('renders a notice with the correct severity level and text', () => {
    const props: ProductNotificationProps = {
      severity: 'critical',
      text: 'This is a critical notification',
    };

    const { container, getByText } = renderWithTheme(
      <ProductNotification {...props} />
    );

    const noticeElement = getByText('This is a critical notification');
    expect(noticeElement).toBeInTheDocument();
    const noticeRoot = container.firstChild;

    expect(noticeRoot).toHaveClass('error-for-scroll');
  });
});
