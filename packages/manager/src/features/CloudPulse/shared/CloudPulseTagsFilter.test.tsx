import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { tagFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseTagsSelect } from './CloudPulseTagsFilter';

import type { useTagsQuery } from 'src/queries/cloudpulse/tags';

const queryMocks = vi.hoisted(() => ({
  useTagsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/tags', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/tags');
  return {
    ...actual,
    useTagsQuery: queryMocks.useTagsQuery,
  };
});

const mockTagsHandler = vi.fn();
const SELECT_ALL = 'Select All';
const ARIA_SELECTED = 'aria-selected';
const LABEL_SUBTITLE = 'Tags (optional)';

describe('CloudPulseTagsSelect component tests', () => {
  beforeEach(() => {
    tagFactory.resetSequenceNumber();
  });

  it('should render a tags select component', () => {
    queryMocks.useTagsQuery.mockReturnValue({
      data: tagFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getByPlaceholderText, getByTestId } = renderWithTheme(
      <CloudPulseTagsSelect
        handleTagsChange={mockTagsHandler}
        label="Tags"
        resourceType={undefined}
      />
    );
    expect(getByTestId('tags-select')).toBeInTheDocument();
    expect(screen.getByLabelText(LABEL_SUBTITLE)).toBeInTheDocument();
    expect(getByPlaceholderText('Select Tags')).toBeInTheDocument();
  });

  it('should render a Tags Select component with error message on api call failure', () => {
    queryMocks.useTagsQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    } as ReturnType<typeof useTagsQuery>);
    const { getByText } = renderWithTheme(
      <CloudPulseTagsSelect
        handleTagsChange={mockTagsHandler}
        label="Tags"
        resourceType="linode"
      />
    );

    expect(getByText('Failed to fetch Tags.'));
  });

  it('should select multiple tags', async () => {
    const user = userEvent.setup();

    queryMocks.useTagsQuery.mockReturnValue({
      data: tagFactory.buildList(3),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(
      <CloudPulseTagsSelect
        handleTagsChange={mockTagsHandler}
        label="Tags"
        resourceType={'linode'}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: 'tag-2' }));
    await user.click(screen.getByRole('option', { name: 'tag-3' }));
    expect(screen.getByLabelText(LABEL_SUBTITLE)).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'tag-2',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      screen.getByRole('option', {
        name: 'tag-3',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      screen.getByRole('option', {
        name: 'tag-4',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('should be able to deselect the selected tags', async () => {
    const user = userEvent.setup();

    queryMocks.useTagsQuery.mockReturnValue({
      data: tagFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(
      <CloudPulseTagsSelect
        handleTagsChange={mockTagsHandler}
        label="Tags"
        resourceType={'linode'}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: SELECT_ALL }));
    await user.click(screen.getByRole('option', { name: 'Deselect All' }));
    expect(screen.getByLabelText(LABEL_SUBTITLE)).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'tag-2',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      screen.getByRole('option', {
        name: 'tag-3',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('Should select the default tags returned from preferences', async () => {
    const user = userEvent.setup();
    queryMocks.useTagsQuery.mockReturnValue({
      data: tagFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseTagsSelect
        defaultValue={['tag-2']}
        handleTagsChange={mockTagsHandler}
        label="Tags"
        resourceType={'linode'}
        savePreferences
      />
    );

    expect(
      screen.getByRole('button', {
        name: 'tag-2',
      })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(
      screen.getByRole('option', {
        name: 'tag-3',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });
});
