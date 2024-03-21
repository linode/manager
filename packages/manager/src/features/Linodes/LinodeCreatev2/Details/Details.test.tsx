import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Details } from './Details';

describe('Linode Create Details', () => {
  it('renders a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext(<Details />);

    const header = getByText('Details');

    expect(header).toBeVisible();
    expect(header.tagName).toBe('H2');
  });

  it('renders a "Linode Label" text field', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext(<Details />);

    expect(getByLabelText('Linode Label')).toBeVisible();
  });

  it('renders an "Add Tags" field', () => {
    const { getByLabelText, getByText } = renderWithThemeAndHookFormContext(
      <Details />
    );

    expect(getByLabelText('Add Tags')).toBeVisible();
    expect(getByText('Type to choose or create a tag.')).toBeVisible();
  });

  it('renders an placement group details if the flag is on', () => {
    const { getByText } = renderWithThemeAndHookFormContext(
      <Details />,
      {},
      {
        flags: { placementGroups: { beta: true, enabled: true } },
      }
    );

    expect(
      getByText('Select a region above to see available Placement Groups.')
    ).toBeVisible();
  });

  it('does not render the placement group select if the flag is off', () => {
    const { queryByText } = renderWithThemeAndHookFormContext(
      <Details />,
      {},
      {
        flags: { placementGroups: { beta: true, enabled: false } },
      }
    );

    expect(
      queryByText('Select a region above to see available Placement Groups.')
    ).toBeNull();
  });
});
