import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DrawerContent, DrawerContentProps } from './DrawerContent';

const defaultChildren = <div>Content</div>;

const renderDrawer = (props: DrawerContentProps) =>
  renderWithTheme(<DrawerContent {...props} />);

const props: DrawerContentProps = {
  children: defaultChildren,
  error: false,
  loading: true,
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
      error: true,
      errorMessage: 'My Error',
      loading: false,
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
