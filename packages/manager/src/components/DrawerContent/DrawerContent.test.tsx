import { screen } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { DrawerContent, Props } from './DrawerContent';

const renderDrawer = (props: Props) =>
  renderWithTheme(
    <DrawerContent {...props}>
      <div>Content</div>
    </DrawerContent>
  );

const props: Props = {
  loading: true,
  error: false,
  title: 'my-drawer',
};

describe('DrawerContent', () => {
  it('should show a loading component while loading is in progress', () => {
    renderDrawer(props);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    expect(screen.getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('should show error if loading is finished but the error persists', () => {
    renderDrawer({
      ...props,
      loading: false,
      error: true,
      errorMessage: 'My Error',
    });
    expect(screen.getByText('My Error')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('circle-progress')).not.toBeInTheDocument();
  });
  it('should display content if there is no error nor loading', () => {
    renderDrawer({ ...props, loading: false });
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
