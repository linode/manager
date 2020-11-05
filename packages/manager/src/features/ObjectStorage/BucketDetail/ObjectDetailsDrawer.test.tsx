import { fireEvent, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import * as objectStorage from '@linode/api-v4/lib/object-storage/objects';
import { renderWithTheme } from 'src/utilities/testHelpers';
import ObjectDetailsDrawer, { Props } from './ObjectDetailsDrawer';

jest.mock('@linode/api-v4/lib/object-storage/objects', () => {
  return {
    getObjectACL: jest.fn().mockResolvedValue({
      acl: 'public-read',
      acl_xml: 'long xml string'
    }),
    updateObjectACL: jest.fn().mockResolvedValue({})
  };
});

const mockUpdateObjectACL = jest.spyOn<any, any>(
  objectStorage,
  'updateObjectACL'
);

jest.mock('src/components/EnhancedSelect/Select');

const props: Props = {
  onClose: jest.fn(),
  open: true,
  lastModified: '2019-12-31T23:59:59Z',
  displayName: 'my-image.png',
  name: 'my-dir/my-image.png',
  size: 12345,
  url: 'https://my-bucket.cluster-id.linodeobjects.com/my-image.png',
  bucketName: 'my-bucket',
  clusterId: 'cluster-id'
};

describe('ObjectDetailsDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders formatted size, formatted last modified, truncated URL', async () => {
    renderWithTheme(<ObjectDetailsDrawer {...props} />);
    await waitFor(() =>
      expect(screen.getByText('12.1 KB')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/^Last modified: 2019-12-31/)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/^https:\/\/my-bucket/)).toBeInTheDocument()
    );
  });

  it("doesn't show last modified if the the time is invalid", async () => {
    renderWithTheme(
      <ObjectDetailsDrawer {...props} lastModified="INVALID DATE" />
    );
    await waitFor(() =>
      expect(screen.queryByTestId('lastModified')).not.toBeInTheDocument()
    );
  });

  it("shows the Object's ACL", async () => {
    renderWithTheme(<ObjectDetailsDrawer {...props} />);
    await waitFor(() => {
      expect(screen.getByText('Public Read')).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });

  it('updates the ACL and submits the appropriate value', async () => {
    renderWithTheme(<ObjectDetailsDrawer {...props} />);

    await waitFor(() => {
      const aclSelect = screen.getByTestId('select');
      fireEvent.change(aclSelect, {
        target: { value: 'private' }
      });

      expect(screen.getByText('Private')).toHaveAttribute(
        'aria-selected',
        'true'
      );

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(mockUpdateObjectACL).toHaveBeenCalledWith(
        'cluster-id',
        'my-bucket',
        'my-dir/my-image.png',
        'private'
      );
    });
  });
});
