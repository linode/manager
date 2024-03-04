import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateNamespaceDrawer } from './CreateNamespaceDrawer';

const props = {
  onClose: vi.fn(),
  open: true,
};

describe('Create Namespace Drawer', () => {
  it('should close the drawer on cancel', () => {
    renderWithTheme(<CreateNamespaceDrawer {...props} />);
    userEvent.click(screen.getByTestId('cancel'));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should render a title', () => {
    renderWithTheme(<CreateNamespaceDrawer {...props} />);
    const title = within(screen.getByTestId('drawer-title')).getByText(
      'Create Namespace'
    );
    expect(title).toBeVisible();
  });

  it('should not accept namespace label shorter than 8 characters', async () => {
    renderWithTheme(<CreateNamespaceDrawer {...props} />);
    userEvent.type(screen.getByLabelText('Label'), 'a123');
    userEvent.click(screen.getByTestId('submit'));
    const error = await screen.findByText(
      /Length must be between 8 and 20 characters./i
    );
    expect(error).toBeInTheDocument();
  });

  it('should not accept namespace label longer than 20 characters', async () => {
    renderWithTheme(<CreateNamespaceDrawer {...props} />);
    userEvent.type(screen.getByLabelText('Label'), 'a12345678912345678912');
    userEvent.click(screen.getByTestId('submit'));
    const error = await screen.findByText(
      /Length must be between 8 and 20 characters./i
    );
    expect(error).toBeInTheDocument();
  });

  it('should not accept namespace label with special characters', async () => {
    renderWithTheme(<CreateNamespaceDrawer {...props} />);
    userEvent.type(screen.getByLabelText('Label'), 'a1234567_');
    userEvent.click(screen.getByTestId('submit'));
    const error = await screen.findByText(
      /Namespace labels cannot contain special characters/i
    );
    expect(error).toBeInTheDocument();
  });

  it('should require region', async () => {
    renderWithTheme(<CreateNamespaceDrawer {...props} />);
    userEvent.type(screen.getByLabelText('Label'), 'a1234567');
    userEvent.click(screen.getByTestId('submit'));
    const error = await screen.findByText(/Region is required/i);
    expect(error).toBeInTheDocument();
  });

  it('should require label', async () => {
    renderWithTheme(<CreateNamespaceDrawer {...props} />);
    userEvent.click(screen.getByTestId('submit'));
    const error = await screen.findByText(/Label is required./i);
    expect(error).toBeInTheDocument();
  });
});
