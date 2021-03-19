import { screen, within } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { BucketDrawer, CombinedProps } from './BucketDrawer';

const props: CombinedProps = {
  isOpen: true,
  openBucketDrawer: jest.fn(),
  closeBucketDrawer: jest.fn(),
  isRestrictedUser: false,
};

describe('BucketDrawer', () => {
  it('should render a Drawer with the title "Create Bucket"', async () => {
    renderWithTheme(<BucketDrawer {...props} />);

    const title = within(screen.getByTestId('drawer-title')).getByText(
      'Create Bucket'
    );
    expect(title).toBeVisible();
  });
});
