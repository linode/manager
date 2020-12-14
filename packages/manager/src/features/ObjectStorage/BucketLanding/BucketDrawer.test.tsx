import { screen } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { BucketDrawer, CombinedProps } from './BucketDrawer';

const props: CombinedProps = {
  isOpen: true,
  openBucketDrawer: jest.fn(),
  closeBucketDrawer: jest.fn(),
  isRestrictedUser: false
};

describe('BucketDrawer', () => {
  it('should render a Drawer with the title "Create a Bucket"', async () => {
    renderWithTheme(<BucketDrawer {...props} />);
    await screen.findByText('Create a Bucket');
  });
});
