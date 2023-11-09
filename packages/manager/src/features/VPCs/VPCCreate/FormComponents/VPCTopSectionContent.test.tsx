import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { VPCTopSectionContent } from './VPCTopSectionContent';

const props = {
  errors: {},
  onChangeField: jest.fn(),
  regions: [],
  values: { description: '', label: '', region: '', subnets: [] },
};

describe('VPC Top Section form content', () => {
  it('renders the vpc top section form content correctly', () => {
    const { getByText } = renderWithTheme(<VPCTopSectionContent {...props} />);

    getByText('Region');
    getByText('VPC Label');
    getByText('Description');
  });
});
