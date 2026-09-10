import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useAclpPreference, usePreferencesToggle } from './UserPreference';

const queryMocks = vi.hoisted(() => ({
  useMutatePreferences: vi.fn(),
  usePreferences: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useMutatePreferences: queryMocks.useMutatePreferences,
    usePreferences: queryMocks.usePreferences,
  };
});

describe('useAclpPreference - updateTimeDurationPreference', () => {
  it('resets only widget granularities invalidated by the new duration, in a single mutate call', () => {
    const mockMutate = vi.fn().mockResolvedValue(undefined);
    queryMocks.usePreferences.mockReturnValue({
      data: {
        aclpPreference: {
          dateTimeDuration: {
            end: '2026-01-01T01:00:00.000Z',
            start: '2026-01-01T00:00:00.000Z',
          },
          widgets: {
            'invalid-widget': {
              label: 'invalid-widget',
              timeGranularity: { unit: 'days', value: 1 },
            },
            'still-valid-widget': {
              label: 'still-valid-widget',
              timeGranularity: { unit: 'min', value: 1 },
            },
          },
        },
      },
      isLoading: false,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: mockMutate,
    });

    const { result } = renderHook(() => useAclpPreference());

    const newDuration = {
      end: '2026-01-01T00:30:00.000Z',
      start: '2026-01-01T00:00:00.000Z',
    };
    result.current.updateTimeDurationPreference(newDuration);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      aclpPreference: {
        dateTimeDuration: newDuration,
        widgets: {
          'invalid-widget': {
            label: 'invalid-widget',
            timeGranularity: { label: 'Auto', unit: 'Auto', value: -1 },
          },
          'still-valid-widget': {
            label: 'still-valid-widget',
            timeGranularity: { unit: 'min', value: 1 },
          },
        },
      },
    });
  });
});

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
