import { Button } from '@linode/ui';
import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Drawer } from './Drawer';

import type { DrawerProps } from './Drawer';

describe('Drawer', () => {
  const defaultArgs: DrawerProps = {
    onClose: vi.fn(),
    open: false,
    title: 'This is a Drawer',
  };

  it.each([
    ['not render', false],
    ['render', true],
  ])('should %s a Dialog with title when open is %s', (_, isOpen) => {
    const { queryByTestId, queryByText } = renderWithTheme(
      <Drawer {...defaultArgs} open={isOpen} />
    );

    const title = queryByText('This is a Drawer');
    const drawer = queryByTestId('drawer');

    if (isOpen) {
      expect(title).toBeInTheDocument();
      expect(drawer).toBeInTheDocument();
    } else {
      expect(title).not.toBeInTheDocument();
      expect(drawer).not.toBeInTheDocument();
    }
  });

  it('should render a Dialog with children if provided', () => {
    const { getByText } = renderWithTheme(
      <Drawer {...defaultArgs} open={true}>
        <p>Child items can go here!</p>
      </Drawer>
    );

    expect(getByText('Child items can go here!')).toBeInTheDocument();
  });

  it('should call onClose when the Dialog close button is clicked', async () => {
    const { getByRole } = renderWithTheme(
      <Drawer {...defaultArgs} open={true}>
        <p>Child items can go here!</p>
        <Button
          onClick={
            defaultArgs.onClose as React.MouseEventHandler<HTMLButtonElement>
          }
        >
          Close
        </Button>
      </Drawer>
    );

    const closeButton = getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(defaultArgs.onClose).toHaveBeenCalled();
    });
  });

  it('should render a Dialog with a loading spinner if isFetching is true', () => {
    const { getByRole } = renderWithTheme(
      <Drawer {...defaultArgs} isFetching open={true} />
    );

    expect(getByRole('progressbar')).toBeVisible();
  });
});
