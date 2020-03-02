import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import RuleDrawer, { CombinedProps } from './RuleDrawer';

const mockOnClose = jest.fn();

const props: CombinedProps = {
  category: 'inbound',
  mode: 'create',
  isOpen: true,
  onClose: mockOnClose
};

afterEach(cleanup);

describe('AddRuleDrawer', () => {
  it('renders the title', () => {
    const { getByText } = renderWithTheme(
      <RuleDrawer {...props} mode="create" category="inbound" />
    );
    getByText('Add an Inbound Rule');
  });
});
