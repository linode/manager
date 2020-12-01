import { fireEvent, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import AccessSelect, { Props } from './AccessSelect';

jest.mock('src/components/EnhancedSelect/Select');

const mockGetAccess = jest.fn();
const mockUpdateAccess = jest.fn();

const props: Props = {
  variant: 'object',
  getAccess: mockGetAccess.mockResolvedValue({ acl: 'public-read' }),
  updateAccess: mockUpdateAccess.mockResolvedValue({}),
  name: 'my-object-name'
};

describe('AccessSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the access', async () => {
    renderWithTheme(<AccessSelect {...props} />);
    await waitFor(() => {
      expect(screen.getByText('Public Read')).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });

  it('updates the access and submits the appropriate value', async () => {
    renderWithTheme(<AccessSelect {...props} />);

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

      expect(mockUpdateAccess).toHaveBeenCalledWith('private', true);
    });
  });
});
