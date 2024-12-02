import { Button, Typography } from '@linode/ui';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DismissibleBanner } from './DismissibleBanner';

describe('Dismissible banner', () => {
  const props = {
    preferenceKey: 'dismissible-banner',
  };

  it('renders a dismissible banner and can dismiss it', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <DismissibleBanner {...props}>
        <Typography>This is a dismissible banner</Typography>
      </DismissibleBanner>
    );
    const text = getByText('This is a dismissible banner');
    expect(text).toBeVisible();
    const dismissButton = getByLabelText('Dismiss dismissible-banner banner');
    expect(dismissButton).toBeVisible();
    fireEvent.click(dismissButton);
    expect(dismissButton).not.toBeInTheDocument();
  });
  it('renders a dismissible banner with an action button', () => {
    const onClickProp = {
      onClick: vi.fn(),
    };

    const { getByText } = renderWithTheme(
      <DismissibleBanner
        {...props}
        actionButton={
          <Button {...onClickProp} buttonType="primary">
            Action button
          </Button>
        }
      >
        <Typography>Banner with action button</Typography>
      </DismissibleBanner>
    );
    const button = getByText('Action button');
    expect(button).toBeVisible();
    fireEvent.click(button);
    expect(onClickProp.onClick).toHaveBeenCalled();
  });
});
