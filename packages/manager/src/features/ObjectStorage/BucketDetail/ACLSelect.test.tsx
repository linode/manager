import { fireEvent, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import ACLSelect, { Props } from './ACLSelect';

jest.mock('src/components/EnhancedSelect/Select');

const mockGetACL = jest.fn();
const mockUpdateACL = jest.fn();

const props: Props = {
  getACL: mockGetACL.mockResolvedValue({ acl: 'public-read' }),
  updateACL: mockUpdateACL.mockResolvedValue({}),
  name: 'my-object-name'
};

describe('ACLSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the ACL', async () => {
    renderWithTheme(<ACLSelect {...props} />);
    await waitFor(() => {
      expect(screen.getByText('Public Read')).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });

  it('updates the ACL and submits the appropriate value', async () => {
    renderWithTheme(<ACLSelect {...props} />);

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

      expect(mockUpdateACL).toHaveBeenCalledWith('private');
    });
  });
});
