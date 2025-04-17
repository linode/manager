import { vi } from 'vitest';

import { usePreferencesToggle } from './UserPreference';

const queryMocks = vi.hoisted(() => ({
  useMutatePreferences: vi.fn(),
  usePreferences: vi.fn(),
}));

vi.mock('@linode/queries', () => ({
  useMutatePreferences: queryMocks.useMutatePreferences,
  usePreferences: queryMocks.usePreferences,
}));

describe('usePreferencesToggle', () => {
  it('should initialize with undefined preference', () => {
    queryMocks.usePreferences.mockReturnValue({ data: undefined });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    });
    const result = usePreferencesToggle({
      preferenceKey: 'aclpAlertsGroupByTag',
      options: [false, true],
      defaultValue: false,
    });
    expect(result.preference).toBeUndefined();
  });

  it('should toggle from undefined to second option', async () => {
    const mockMutate = vi.fn().mockResolvedValue(undefined);
    queryMocks.usePreferences.mockReturnValue({ data: undefined });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: mockMutate,
    });

    const result = usePreferencesToggle({
      preferenceKey: 'aclpAlertsGroupByTag',
      options: [false, true],
      defaultValue: false,
    });

    const newValue = result.toggle();
    expect(newValue).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith({ aclpAlertsGroupByTag: true });
  });

  it('should toggle between options', async () => {
    const mockMutate = vi.fn().mockResolvedValue(undefined);
    queryMocks.usePreferences.mockReturnValue({ data: false });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: mockMutate,
    });

    const result = usePreferencesToggle({
      preferenceKey: 'aclpAlertsGroupByTag',
      options: [false, true],
      defaultValue: false,
    });

    const newValue = result.toggle();
    expect(newValue).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith({ aclpAlertsGroupByTag: true });
  });
});
