import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import ObjectDetailsDrawer, { Props } from './ObjectDetailsDrawer';

const props: Props = {
  onClose: jest.fn(),
  open: true,
  lastModified: '2019-12-31T23:59:59Z',
  name: 'my-image.png',
  size: 12345,
  url: 'https://my-bucket.cluster-id.linodeobjects.com/my-image.png'
};

describe('ObjectDetailsDrawer', () => {
  it('renders formatted size, formatted last modified, truncated URL', () => {
    const { getByText } = renderWithTheme(<ObjectDetailsDrawer {...props} />);
    getByText('12.1 KB');
    getByText(/^Last modified: 2019-12-31/);
    getByText(/^https:\/\/my-bucket/);
  });

  it("doesn't show last modified if the the time is invalid", () => {
    const { queryByTestId } = renderWithTheme(
      <ObjectDetailsDrawer {...props} lastModified="INVALID DATE" />
    );
    expect(queryByTestId('lastModified')).not.toBeInTheDocument();
  });
});
