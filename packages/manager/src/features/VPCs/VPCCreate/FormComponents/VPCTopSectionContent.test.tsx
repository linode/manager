import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { VPCTopSectionContent } from './VPCTopSectionContent';

const props = {
  regions: [],
};

describe('VPC Top Section form content', () => {
  it('renders the vpc top section form content correctly', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <VPCTopSectionContent {...props} />,
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
        },
      },
    });

    expect(getByText('Region')).toBeVisible();
    expect(getByText('VPC Label')).toBeVisible();
    expect(getByText('Description')).toBeVisible();
  });
});
