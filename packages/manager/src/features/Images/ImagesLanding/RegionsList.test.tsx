import userEvent from '@testing-library/user-event';
import * as React from 'react';

import 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RegionsList } from './RegionsList';

describe('RegionsList', () => {
  it('should render a single region', async () => {
    const { findByText } = renderWithTheme(
      <RegionsList
        onManageRegions={vi.fn()}
        regions={[{ region: 'us-east', status: 'available' }]}
      />
    );

    // Should initially fallback to region id
    await findByText('us-east');
    await findByText('US, Newark, NJ');
  });

  it('should allow expanding to view multiple regions', async () => {
    const manageRegions = vi.fn();

    const { findByRole, findByText } = renderWithTheme(
      <RegionsList
        regions={[
          { region: 'us-east', status: 'available' },
          { region: 'us-southeast', status: 'pending' },
        ]}
        onManageRegions={manageRegions}
      />
    );

    await findByText((text) => text.includes('US, Newark, NJ'));
    const expand = await findByRole('button');
    expect(expand).toHaveTextContent('+1');

    await userEvent.click(expand);
    expect(manageRegions).toBeCalled();
  });
});
