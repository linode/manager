import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { ImportGroupsAsTags } from './ImportGroupsAsTags';

const props = {
  openDrawer: jest.fn(),
};

describe('Component', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<ImportGroupsAsTags {...props} />);
    expect(getByText('Import Display Groups as Tags')).toBeInTheDocument();
  });
  it('should open the tag import drawer on click', () => {
    const { getByTestId } = renderWithTheme(<ImportGroupsAsTags {...props} />);
    fireEvent.click(getByTestId('open-import-drawer'));
    expect(props.openDrawer).toHaveBeenCalled();
  });
});
