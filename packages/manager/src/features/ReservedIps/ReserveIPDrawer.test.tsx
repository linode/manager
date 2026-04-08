import { regionFactory } from '@linode/utilities';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ipAddressFactory, reservedIPsTypeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ReserveIPDrawer } from './ReserveIPDrawer';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
  useIsGeckoEnabled: vi.fn().mockReturnValue({ isGeckoLAEnabled: false }),
  useRegionsQuery: vi.fn(),
  useReserveIPMutation: vi.fn(),
  useReservedIPTypesQuery: vi.fn(),
  useUpdateReservedIPMutation: vi.fn(),
  useUpdateIPMutation: vi.fn(),
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery,
  useReserveIPMutation: queryMocks.useReserveIPMutation,
  useReservedIPTypesQuery: queryMocks.useReservedIPTypesQuery,
  useUpdateReservedIPMutation: queryMocks.useUpdateReservedIPMutation,
  useUpdateIPMutation: queryMocks.useUpdateIPMutation,
}));

vi.mock('@linode/shared', async (importOriginal) => ({
  ...(await importOriginal()),
  useIsGeckoEnabled: queryMocks.useIsGeckoEnabled,
}));

vi.mock('src/hooks/useFlags', async (importOriginal) => ({
  ...(await importOriginal()),
  useFlags: queryMocks.useFlags,
}));

const regions = regionFactory.buildList(2);
const reservedIPType = reservedIPsTypeFactory.build();
const mockReserveIP = vi
  .fn()
  .mockResolvedValue(
    ipAddressFactory.build({ address: '192.0.2.1', reserved: true })
  );
const mockUpdateReservedIP = vi.fn().mockResolvedValue({});
const mockUpdateIP = vi.fn().mockResolvedValue({});
const mockOnClose = vi.fn();

const defaultMocks = () => {
  queryMocks.useRegionsQuery.mockReturnValue({
    data: regions,
    isLoading: false,
  });
  queryMocks.useReservedIPTypesQuery.mockReturnValue({
    data: [reservedIPType],
    isLoading: false,
  });
  queryMocks.useReserveIPMutation.mockReturnValue({
    mutateAsync: mockReserveIP,
  });
  queryMocks.useUpdateReservedIPMutation.mockReturnValue({
    mutateAsync: mockUpdateReservedIP,
  });
  queryMocks.useUpdateIPMutation.mockReturnValue({
    mutateAsync: mockUpdateIP,
  });
};

beforeEach(() => {
  defaultMocks();
  mockOnClose.mockClear();
  mockReserveIP.mockClear();
  mockUpdateReservedIP.mockClear();
  mockUpdateIP.mockClear();
});

const RESERVE_IP_TITLE = 'Reserve an IP Address';
const REGION_SELECT_TEST_ID = 'region-select';
const RESERVE_BUTTON_LABEL = 'Reserve IP Address';
const REGION_OPEN_BUTTON_LABEL = 'Open';

describe('ReserveIPDrawer - loading state', () => {
  it('shows a loading spinner while data is loading', () => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: null,
      isLoading: true,
    });

    renderWithTheme(
      <ReserveIPDrawer mode="create" onClose={mockOnClose} open />
    );

    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: RESERVE_BUTTON_LABEL })
    ).toBeNull();
  });

  it('shows the form once all data has loaded', () => {
    renderWithTheme(
      <ReserveIPDrawer mode="create" onClose={mockOnClose} open />
    );

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(
      screen.getByRole('button', { name: RESERVE_BUTTON_LABEL })
    ).toBeVisible();
  });
});

describe('ReserveIPDrawer - create mode', () => {
  it('renders the correct title', () => {
    renderWithTheme(
      <ReserveIPDrawer mode="create" onClose={mockOnClose} open />
    );

    expect(screen.getByText(RESERVE_IP_TITLE)).toBeVisible();
  });

  it('renders the description and docs link', () => {
    renderWithTheme(
      <ReserveIPDrawer mode="create" onClose={mockOnClose} open />
    );

    expect(screen.getByText(/Reserve a public IPv4 address/i)).toBeVisible();
    expect(screen.getByText('Learn more')).toBeVisible();
  });

  it('does not show the IP address field', () => {
    renderWithTheme(
      <ReserveIPDrawer mode="create" onClose={mockOnClose} open />
    );

    expect(screen.queryByLabelText('IP Address')).toBeNull();
  });

  it('Reserve button is disabled when no region is selected', () => {
    renderWithTheme(
      <ReserveIPDrawer mode="create" onClose={mockOnClose} open />
    );

    expect(
      screen.getByRole('button', { name: RESERVE_BUTTON_LABEL })
    ).toBeDisabled();
  });

  it('calls reserveIP mutation and closes on successful submit', async () => {
    renderWithTheme(
      <ReserveIPDrawer mode="create" onClose={mockOnClose} open />
    );

    const regionSelect = screen.getByTestId(REGION_SELECT_TEST_ID);
    await userEvent.click(
      within(regionSelect).getByRole('button', {
        name: REGION_OPEN_BUTTON_LABEL,
      })
    );
    await userEvent.click(
      await screen.findByRole('option', {
        name: new RegExp(regions[0].label, 'i'),
      })
    );

    const reserveButton = screen.getByRole('button', {
      name: RESERVE_BUTTON_LABEL,
    });
    await waitFor(() => expect(reserveButton).toBeEnabled());

    await userEvent.click(reserveButton);

    await waitFor(() => {
      expect(mockReserveIP).toHaveBeenCalledWith({
        region: regions[0].id,
        tags: [],
      });
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows root error notice when API returns an error', async () => {
    mockReserveIP.mockRejectedValueOnce([{ reason: 'Region is unavailable.' }]);

    renderWithTheme(
      <ReserveIPDrawer mode="create" onClose={mockOnClose} open />
    );

    const regionSelect = screen.getByTestId(REGION_SELECT_TEST_ID);
    await userEvent.click(
      within(regionSelect).getByRole('button', {
        name: REGION_OPEN_BUTTON_LABEL,
      })
    );
    await userEvent.click(
      await screen.findByRole('option', {
        name: new RegExp(regions[0].label, 'i'),
      })
    );

    const reserveButton = screen.getByRole('button', {
      name: RESERVE_BUTTON_LABEL,
    });
    await waitFor(() => expect(reserveButton).toBeEnabled());
    await userEvent.click(reserveButton);

    await waitFor(() => {
      expect(screen.getByText('Region is unavailable.')).toBeVisible();
    });
  });
});

describe('ReserveIPDrawer - edit mode', () => {
  const existingIP = ipAddressFactory.build({
    address: '198.51.100.5',
    region: regions[0].id,
    reserved: true,
    tags: ['prod'],
  });

  it('renders the correct title', () => {
    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={existingIP}
        mode="edit"
        onClose={mockOnClose}
        open
      />
    );

    expect(screen.getByText('Edit Reserved IP')).toBeVisible();
  });

  it('shows the IP address field', () => {
    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={existingIP}
        mode="edit"
        onClose={mockOnClose}
        open
      />
    );

    expect(screen.getByText('IP Address')).toBeVisible();
  });

  it('region select is disabled', async () => {
    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={existingIP}
        mode="edit"
        onClose={mockOnClose}
        open
      />
    );

    const regionCombobox = screen.getByRole('combobox', { name: /region/i });
    expect(regionCombobox).toBeDisabled();
  });

  it('Save button is disabled until the form is dirtied', async () => {
    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={existingIP}
        mode="edit"
        onClose={mockOnClose}
        open
      />
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('calls updateReservedIP mutation and closes on successful submit', async () => {
    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={existingIP}
        mode="edit"
        onClose={mockOnClose}
        open
      />
    );

    // Add a new tag to dirty the form
    const tagsInput = screen.getByRole('combobox', { name: /tags/i });
    await userEvent.type(tagsInput, 'staging{enter}');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateReservedIP).toHaveBeenCalled();
    });
    expect(mockOnClose).toHaveBeenCalled();
  });
});

describe('ReserveIPDrawer - reserve mode', () => {
  const existingIP = ipAddressFactory.build({
    address: '203.0.113.10',
    region: regions[1].id,
    reserved: false,
    tags: [],
  });

  it('renders the correct title', () => {
    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={existingIP}
        mode="reserve"
        onClose={mockOnClose}
        open
      />
    );

    expect(screen.getByText(RESERVE_IP_TITLE)).toBeVisible();
  });

  it('shows the IP address as a disabled field', () => {
    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={existingIP}
        mode="reserve"
        onClose={mockOnClose}
        open
      />
    );

    expect(screen.getByText('203.0.113.10')).toBeVisible();
  });

  it('region select is disabled', () => {
    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={existingIP}
        mode="reserve"
        onClose={mockOnClose}
        open
      />
    );

    expect(screen.getByRole('combobox', { name: /region/i })).toBeDisabled();
  });

  it('Reserve button is enabled without any user interaction', () => {
    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={existingIP}
        mode="reserve"
        onClose={mockOnClose}
        open
      />
    );

    expect(
      screen.getByRole('button', { name: RESERVE_BUTTON_LABEL })
    ).toBeEnabled();
  });

  it('calls updatedIP mutation and closes on submit', async () => {
    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={existingIP}
        mode="reserve"
        onClose={mockOnClose}
        open
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: RESERVE_BUTTON_LABEL })
    );

    await waitFor(() => {
      expect(mockUpdateIP).toHaveBeenCalled();
    });
    expect(mockOnClose).toHaveBeenCalled();
  });
});

describe('ReserveIPDrawer - cancel button', () => {
  it('calls onClose when Cancel is clicked', async () => {
    renderWithTheme(
      <ReserveIPDrawer mode="create" onClose={mockOnClose} open />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});

describe('ReserveIPDrawer - pricing', () => {
  it('shows the monthly price in create mode once a region is selected', async () => {
    renderWithTheme(
      <ReserveIPDrawer mode="create" onClose={mockOnClose} open />
    );

    const regionSelect = screen.getByTestId(REGION_SELECT_TEST_ID);
    await userEvent.click(
      within(regionSelect).getByRole('button', {
        name: REGION_OPEN_BUTTON_LABEL,
      })
    );
    await userEvent.click(
      await screen.findByRole('option', {
        name: new RegExp(regions[0].label, 'i'),
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          (text) => text.startsWith('$') && text.endsWith(' / mo.')
        )
      ).toBeVisible();
    });
  });

  it('does not show the price in edit mode', () => {
    const editIP = ipAddressFactory.build({
      region: regions[0].id,
      reserved: true,
    });

    renderWithTheme(
      <ReserveIPDrawer
        ipAddress={editIP}
        mode="edit"
        onClose={mockOnClose}
        open
      />
    );

    expect(
      screen.queryByText((text) => text.startsWith('$') && text.endsWith('/mo'))
    ).toBeNull();
  });
});
