import { fireEvent } from '@testing-library/react';
import React from 'react'; // for better assertion messages
import { queryClientFactory } from 'src/queries/base';

import { VLANAccordion } from './VLANAccordion'; // adjust the import path based on your project structure
import { renderWithTheme } from 'src/utilities/testHelpers';

import type { VLANAccordionProps } from './VLANAccordion';

const queryClient = queryClientFactory();

const defaultProps: VLANAccordionProps = {
  handleVLANChange: vi.fn(),
  helperText: 'helper text',
  ipamAddress: '',
  vlanLabel: '',
};

describe('VLANAccordion Component', () => {
  it('renders VLANAccordion component with default props', () => {
    const { getByText } = renderWithTheme(<VLANAccordion {...defaultProps} />, {
      queryClient,
    });

    expect(getByText('VLAN')).toBeInTheDocument();
  });
});
