import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerConfigConfirmationActions } from './NodeBalancerConfigConfirmationActions';

import type { NodeBalancerConfigConfirmationActionsPros } from './NodeBalancerConfigConfirmationActions';

const props: NodeBalancerConfigConfirmationActionsPros = {
  isLoading: false,
  onClose: vi.fn(),
  onDelete: vi.fn(),
};

describe('NodeBalancerConfigConfirmationActions', () => {
  test('should call onClose handler upon clicking cancel button', () => {
    renderWithTheme(<NodeBalancerConfigConfirmationActions {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(props.onClose).toHaveBeenCalled();
  });
  test('should call onDelete handler upon clicking delete button', () => {
    renderWithTheme(<NodeBalancerConfigConfirmationActions {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(props.onDelete).toHaveBeenCalled();
  });
});
