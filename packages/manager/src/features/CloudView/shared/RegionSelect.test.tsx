import * as React from 'react';

import { regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudViewRegionSelectProps } from './RegionSelect';
import { CloudViewRegionSelect } from './RegionSelect';

import type { Region } from '@linode/api-v4';

const props: CloudViewRegionSelectProps = {
  handleRegionChange: vi.fn(),
};

describe('CloudViewRegionSelect', () => {
  const regions: Region[] = regionFactory.buildList(3);

  it('should render a Region Select component', () => {
    const { getByTestId } = renderWithTheme(
      <CloudViewRegionSelect {...props} />
    );
    expect(getByTestId('region-select')).toBeInTheDocument();
  });
});
