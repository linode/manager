import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditShareGroupDrawer } from './EditShareGroupDrawer';

const mockUpdateShareGroup = vi.fn().mockResolvedValue({});

const queryMocks = vi.hoisted(() => ({
  useUpdateShareGroupMutation: vi.fn(() => ({
    mutateAsync: mockUpdateShareGroup,
  })),
}));

vi.mock('@linode/queries', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useUpdateShareGroupMutation: queryMocks.useUpdateShareGroupMutation,
  };
});

describe('Edit Share Group Drawer', () => {
  const SHARE_GROUP_NAME_LABEL = 'Share group name';
  const DESCRIPTION_LABEL = 'Description';
  const SAVE_CHANGES_TEXT = 'Save Changes';

  const mockShareGroup = {
    id: 1,
    label: 'Test Share Group',
    description: 'Test description',
    members: [],
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-01T00:00:00Z',
    is_suspended: false,
    uuid: 'test-uuid',
  };

  const props = {
    errors: null,
    isFetching: false,
    onClose: vi.fn(),
    open: true,
    shareGroup: mockShareGroup,
  };

  beforeEach(() => {
    mockUpdateShareGroup.mockClear();
    queryMocks.useUpdateShareGroupMutation.mockClear();
    vi.clearAllMocks();
  });

  it('should render a title, label input, description input, and action buttons', () => {
    const { getByText, getByLabelText } = renderWithTheme(
      <EditShareGroupDrawer {...props} />
    );

    const drawerTitle = getByText('Edit Group Details');
    expect(drawerTitle).toBeVisible();

    const labelInput = getByLabelText(SHARE_GROUP_NAME_LABEL);
    expect(labelInput).toBeVisible();
    expect(labelInput).toBeEnabled();

    const descriptionInput = getByLabelText(DESCRIPTION_LABEL);
    expect(descriptionInput).toBeVisible();
    expect(descriptionInput).toBeEnabled();

    const saveButton = getByText(SAVE_CHANGES_TEXT);
    expect(saveButton).toBeVisible();

    const cancelButton = getByText('Cancel');
    expect(cancelButton).toBeVisible();
  });

  it('should allow editing share group details', async () => {
    const { getByLabelText, getByRole } = renderWithTheme(
      <EditShareGroupDrawer {...props} />
    );

    const labelInput = getByLabelText(
      SHARE_GROUP_NAME_LABEL
    ) as HTMLInputElement;
    fireEvent.change(labelInput, {
      target: { value: 'Updated Label' },
    });

    const saveButton = getByRole('button', { name: SAVE_CHANGES_TEXT });
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateShareGroup).toHaveBeenCalledWith({
        data: {
          label: 'Updated Label',
          description: 'Test description',
        },
        sharegroupId: '1',
      });
    });
  });

  it('should close the drawer after successful submission', async () => {
    const onClose = vi.fn();

    const { getByLabelText, getByRole } = renderWithTheme(
      <EditShareGroupDrawer {...props} onClose={onClose} />
    );

    const labelInput = getByLabelText(
      SHARE_GROUP_NAME_LABEL
    ) as HTMLInputElement;
    fireEvent.change(labelInput, {
      target: { value: 'New Label' },
    });

    const saveButton = getByRole('button', { name: SAVE_CHANGES_TEXT });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
