import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertsTagFilter } from './AlertsTagsFilter';

describe('AlertsTagsFilters', () => {
  it('calls handleSelection with correct arguments when list of tags is selected', async () => {
    // Mock the handleSelection function
    const handleSelection = vi.fn();
    const tagsOptions = ['tag1', 'tag2', 'tag3'];

    // Render the component
    const { getByRole } = renderWithTheme(
      <AlertsTagFilter
        handleFilterChange={handleSelection}
        tagOptions={tagsOptions}
      />
    );

    await userEvent.click(getByRole('button', { name: 'Open' }));
    expect(getByRole('option', { name: 'tag1' })).toBeInTheDocument();
    // Select an option
    await userEvent.click(getByRole('option', { name: 'tag1' }));
    await userEvent.click(getByRole('option', { name: 'tag2' }));

    await userEvent.click(getByRole('button', { name: 'Close' }));
    // Assert that the handleSelection function is called with the expected arguments
    expect(handleSelection).toHaveBeenLastCalledWith(['tag1', 'tag2'], 'tags');
  });
});
