import { linodeFactory } from '@linode/utilities';
import { renderHook, waitFor } from '@testing-library/react';

import { accountFactory, accountMaintenanceFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';

import {
  addMaintenanceToLinodes,
  useIsGenerationalPlansEnabled,
  useIsLinodeCloneFirewallEnabled,
  useIsLinodeInterfacesEnabled,
} from './linodes';
import { wrapWithTheme } from './testHelpers';

describe('addMaintenanceToLinodes', () => {
  it('adds relevant maintenance items to Linodes', () => {
    const linodes = linodeFactory.buildList(2);
    const accountMaintenance = accountMaintenanceFactory.buildList(1, {
      entity: { type: 'linode' },
    });
    const result = addMaintenanceToLinodes(accountMaintenance, linodes);
    expect(result[0].maintenance).not.toBeNull();
    expect(result[1].maintenance).toBeNull();
    expect(result[0].maintenance?.when).toBe(accountMaintenance[0].when);
  });
});

describe('useIsLinodeInterfacesEnabled', () => {
  it('returns isLinodeInterfacesEnabled: true if the feature is enabled and account has the capability', async () => {
    const options = { flags: { linodeInterfaces: { enabled: true } } };
    const account = accountFactory.build({
      capabilities: ['Linode Interfaces'],
    });

    server.use(
      http.get('*/v4*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { result } = renderHook(() => useIsLinodeInterfacesEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current?.isLinodeInterfacesEnabled).toBe(true);
    });
  });

  it('returns isLinodeInterfacesEnabled: false if the feature is NOT enabled', () => {
    const options = { flags: { linodeInterfaces: { enabled: false } } };

    const { result } = renderHook(() => useIsLinodeInterfacesEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.isLinodeInterfacesEnabled).toBe(false);
  });
});

describe('useIsLinodeCloneFirewallEnabled', () => {
  it('returns isLinodeCloneFirewallEnabled: true if the feature is enabled', () => {
    const options = { flags: { linodeCloneFirewall: true } };

    const { result } = renderHook(() => useIsLinodeCloneFirewallEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.isLinodeCloneFirewallEnabled).toBe(true);
  });

  it('returns isLinodeCloneFirewallEnabled: false if the feature is NOT enabled', () => {
    const options = { flags: { linodeCloneFirewall: false } };

    const { result } = renderHook(() => useIsLinodeCloneFirewallEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.isLinodeCloneFirewallEnabled).toBe(false);
  });
});

describe('useIsGenerationalPlansEnabled', () => {
  const G7_DEDICATED_PLAN = { id: 'g7-dedicated-4' };
  const G8_DEDICATED_PLAN = { id: 'g8-dedicated-4-2' };
  const G6_STANDARD_PLAN = { id: 'g6-standard-1' };
  const GPU_PLAN = { id: 'gpu-rtx6000-1' };
  const G7_PREMIUM_PLAN = { id: 'g7-premium-4' };

  it('returns isGenerationalPlansEnabled: true if the feature is enabled', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const { result } = renderHook(() => useIsGenerationalPlansEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.isGenerationalPlansEnabled).toBe(true);
  });

  it('returns isGenerationalPlansEnabled: false if the feature is NOT enabled', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: false, allowedPlans: [] } },
    };

    const { result } = renderHook(() => useIsGenerationalPlansEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.isGenerationalPlansEnabled).toBe(false);
  });

  it('returns isGenerationalPlansEnabled: true when flag is enabled and both G7 and G8 dedicated plans are available for dedicated planType', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const plans = [G7_DEDICATED_PLAN, G8_DEDICATED_PLAN, G6_STANDARD_PLAN];

    const { result } = renderHook(
      () => useIsGenerationalPlansEnabled(plans, 'dedicated'),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    expect(result.current?.isGenerationalPlansEnabled).toBe(true);
  });

  it('returns isGenerationalPlansEnabled: true when flag is enabled and only G7 dedicated plans are available for dedicated planType', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const plans = [G7_DEDICATED_PLAN, G6_STANDARD_PLAN];

    const { result } = renderHook(
      () => useIsGenerationalPlansEnabled(plans, 'dedicated'),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    expect(result.current?.isGenerationalPlansEnabled).toBe(true);
  });

  it('returns isGenerationalPlansEnabled: true when flag is enabled and only G8 dedicated plans are available for dedicated planType', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const plans = [G8_DEDICATED_PLAN, G6_STANDARD_PLAN];

    const { result } = renderHook(
      () => useIsGenerationalPlansEnabled(plans, 'dedicated'),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    expect(result.current?.isGenerationalPlansEnabled).toBe(true);
  });

  it('returns isGenerationalPlansEnabled: false when flag is enabled but neither G7 nor G8 dedicated plans are available for dedicated planType', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const plans = [
      G6_STANDARD_PLAN,
      { id: 'g6-dedicated-2' },
      G7_PREMIUM_PLAN, // Not a g7-dedicated plan
    ];

    const { result } = renderHook(
      () => useIsGenerationalPlansEnabled(plans, 'dedicated'),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    expect(result.current?.isGenerationalPlansEnabled).toBe(false);
  });

  it('returns isGenerationalPlansEnabled: true when flag is enabled but plans array is empty', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const { result } = renderHook(() => useIsGenerationalPlansEnabled([]), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.isGenerationalPlansEnabled).toBe(true);
  });

  it('returns isGenerationalPlansEnabled: false when flag is disabled regardless of plan availability', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: false, allowedPlans: [] } },
    };

    const plans = [G7_DEDICATED_PLAN, G8_DEDICATED_PLAN];

    const { result } = renderHook(
      () => useIsGenerationalPlansEnabled(plans, 'dedicated'),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    expect(result.current?.isGenerationalPlansEnabled).toBe(false);
  });

  it('returns isGenerationalPlansEnabled: true for gpu planType when flag is enabled, regardless of G7/G8 availability', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const plans = [GPU_PLAN, G6_STANDARD_PLAN]; // No G7/G8 plans

    const { result } = renderHook(
      () => useIsGenerationalPlansEnabled(plans, 'gpu'),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    expect(result.current?.isGenerationalPlansEnabled).toBe(true);
  });

  it('returns isGenerationalPlansEnabled: true for highmem planType when flag is enabled, regardless of G7/G8 availability', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const plans = [{ id: 'g6-highmem-1' }]; // No G7/G8 plans

    const { result } = renderHook(
      () => useIsGenerationalPlansEnabled(plans, 'highmem'),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    expect(result.current?.isGenerationalPlansEnabled).toBe(true);
  });

  it('returns isGenerationalPlansEnabled: true for standard planType when flag is enabled, regardless of G7/G8 availability', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const plans = [G6_STANDARD_PLAN]; // No G7/G8 plans

    const { result } = renderHook(
      () => useIsGenerationalPlansEnabled(plans, 'standard'),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    expect(result.current?.isGenerationalPlansEnabled).toBe(true);
  });

  it('returns isGenerationalPlansEnabled: true for premium planType when G7 dedicated plans are available', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const plans = [G7_DEDICATED_PLAN, G7_PREMIUM_PLAN];

    const { result } = renderHook(
      () => useIsGenerationalPlansEnabled(plans, 'premium'),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    expect(result.current?.isGenerationalPlansEnabled).toBe(true);
  });

  it('returns isGenerationalPlansEnabled: false for premium planType when no G7/G8 dedicated plans are available', () => {
    const options = {
      flags: { generationalPlansv2: { enabled: true, allowedPlans: [] } },
    };

    const plans = [G7_PREMIUM_PLAN, { id: 'g6-premium-2' }]; // Premium plans but no dedicated G7/G8

    const { result } = renderHook(
      () => useIsGenerationalPlansEnabled(plans, 'premium'),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    expect(result.current?.isGenerationalPlansEnabled).toBe(false);
  });
});
