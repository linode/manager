import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseTagsSelect } from './CloudPulseTagsFilter';

import type { CloudPulseTagsSelectProps } from './CloudPulseTagsFilter';
import type { useAllLinodesQuery } from '@linode/queries';

const props: CloudPulseTagsSelectProps = {
  disabled: false,
  handleTagsChange: vi.fn(),
  label: 'Tags',
  optional: true,
  region: 'us-east',
  resourceType: 'linode',
};

const queryMocks = vi.hoisted(() => ({
  useAllLinodesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllLinodesQuery: queryMocks.useAllLinodesQuery,
  };
});

const SELECT_ALL = 'Select All';
const ARIA_SELECTED = 'aria-selected';
const LABEL_SUBTITLE = 'Tags (optional)';

describe('CloudPulseTagsSelect component tests', () => {
  beforeEach(() => {
    linodeFactory.resetSequenceNumber();
  });

  it('should render a tags select component', () => {
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: linodeFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const {
      getByLabelText,
      getByPlaceholderText,
      getByTestId,
    } = renderWithTheme(<CloudPulseTagsSelect {...props} />);
    expect(getByTestId('tags-select')).toBeInTheDocument();
    expect(getByLabelText(LABEL_SUBTITLE)).toBeInTheDocument();
    expect(getByPlaceholderText('Select Tags')).toBeInTheDocument();
  });

  it('should render a disabled Tags Select component when disabled is true or region is undefined', () => {
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: linodeFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getByRole } = renderWithTheme(
      <CloudPulseTagsSelect {...props} disabled={true} />
    );

    expect(getByRole('button', { name: 'Open' })).toBeDisabled();
  });

  it('should render a Tags Select component with error message on api call failure', () => {
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    } as ReturnType<typeof useAllLinodesQuery>);
    const { getByText } = renderWithTheme(<CloudPulseTagsSelect {...props} />);

    expect(getByText('Failed to fetch Tags.'));
  });

  it('should render a Tags Select component with tags filtered based on the selected region', async () => {
    const user = userEvent.setup();

    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [],
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getByRole, queryAllByRole } = renderWithTheme(
      <CloudPulseTagsSelect {...props} region={'us-central'} />
    );
    await user.click(getByRole('button', { name: 'Open' }));
    const options = queryAllByRole('option');
    expect(options).toHaveLength(0); // no tags for the selected region
  });

  it('should select multiple tags from the tags filtered based on the selected region', async () => {
    const user = userEvent.setup();

    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: linodeFactory.buildList(3, {
        tags: ['tag-2', 'tag-3', 'tag-4'],
      }),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getByLabelText, getByRole } = renderWithTheme(
      <CloudPulseTagsSelect {...props} />
    );
    await user.click(getByRole('button', { name: 'Open' }));
    await user.click(getByRole('option', { name: 'tag-2' }));
    await user.click(getByRole('option', { name: 'tag-3' }));
    expect(getByLabelText(LABEL_SUBTITLE)).toBeInTheDocument();

    expect(
      getByRole('option', {
        name: 'tag-2',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      getByRole('option', {
        name: 'tag-3',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      getByRole('option', {
        name: 'tag-4',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('should be able to deselect the selected tags', async () => {
    const user = userEvent.setup();

    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: linodeFactory.buildList(2, { tags: ['tag-2', 'tag-3'] }),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getByLabelText, getByRole } = renderWithTheme(
      <CloudPulseTagsSelect {...props} />
    );
    await user.click(getByRole('button', { name: 'Open' }));
    await user.click(getByRole('option', { name: SELECT_ALL }));
    await user.click(getByRole('option', { name: 'Deselect All' }));
    expect(getByLabelText(LABEL_SUBTITLE)).toBeInTheDocument();
    expect(
      getByRole('option', {
        name: 'tag-2',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      getByRole('option', {
        name: 'tag-3',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('Should select the default tags returned from preferences', async () => {
    const user = userEvent.setup();
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: linodeFactory.buildList(2, { tags: ['tag-2', 'tag-3'] }),
      isError: false,
      isLoading: false,
      status: 'success',
    });

    const { getByRole } = renderWithTheme(
      <CloudPulseTagsSelect
        {...props}
        defaultValue={['tag-2']}
        savePreferences
      />
    );

    expect(
      getByRole('button', {
        name: 'tag-2',
      })
    ).toBeInTheDocument();

    await user.click(getByRole('button', { name: 'Open' }));

    expect(
      getByRole('option', {
        name: 'tag-3',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });
});
