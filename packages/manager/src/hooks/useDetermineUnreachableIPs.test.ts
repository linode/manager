import { queryClientFactory } from '@linode/queries';
import {
  configFactory,
  linodeConfigInterfaceFactory,
  linodeConfigInterfaceFactoryWithVPC,
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVlan,
  linodeInterfaceFactoryVPC,
} from '@linode/utilities';
import { renderHook, waitFor } from '@testing-library/react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  useDetermineUnreachableIPsConfigInterface,
  useDetermineUnreachableIPsLinodeInterface,
} from './useDetermineUnreachableIPs';

const queryClient = queryClientFactory();

describe('useDetermineUnreachableIPsLinodeInterface', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('shows that public ipv4 and ipv6 are both unreachable if Linode has no interfaces', async () => {
    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({ interfaces: [] });
      })
    );

    const { result } = renderHook(
      () => useDetermineUnreachableIPsLinodeInterface(1, true),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv4LinodeInterface).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv6LinodeInterface).toBe(true);
    });
  });

  it('shows that public ipv6 is unreachable if Linode has no public interface', async () => {
    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({
          interfaces: [
            linodeInterfaceFactoryVPC.build({
              vpc: {
                ipv4: {
                  addresses: [
                    {
                      address: '10.0.0.0',
                      primary: true,
                      nat_1_1_address: 'auto',
                    },
                  ],
                },
              },
            }),
          ],
        });
      })
    );

    const { result } = renderHook(
      () => useDetermineUnreachableIPsLinodeInterface(1, true),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv4LinodeInterface).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv6LinodeInterface).toBe(true);
    });
  });

  it('shows that public ipv4 (and ipv6) are both unreachable if Linode is "VPC only" and has no public interface', async () => {
    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({
          interfaces: [linodeInterfaceFactoryVPC.build()],
        });
      })
    );

    const { result } = renderHook(
      () => useDetermineUnreachableIPsLinodeInterface(1, true),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv4LinodeInterface).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv6LinodeInterface).toBe(true);
    });
  });

  it('shows that public ipv4 (and ipv6) are both unreachable if Linode only has a VLAN interface', async () => {
    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({
          interfaces: [linodeInterfaceFactoryVlan.build()],
        });
      })
    );

    const { result } = renderHook(
      () => useDetermineUnreachableIPsLinodeInterface(1, true),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv4LinodeInterface).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv6LinodeInterface).toBe(true);
    });
  });

  it('shows that public ipv4 is unreachable (but ipv6 is reachable) if Linode is a "VPC only Linode" and has public interface', async () => {
    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({
          interfaces: [
            linodeInterfaceFactoryVPC.build(),
            linodeInterfaceFactoryPublic.build(),
          ],
        });
      })
    );

    const { result } = renderHook(
      () => useDetermineUnreachableIPsLinodeInterface(1, true),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv4LinodeInterface).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv6LinodeInterface).toBe(false);
    });
  });

  it('shows public IPs are reachable if Linode is not a "VPC only Linode" and has public interface', async () => {
    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({
          interfaces: [
            linodeInterfaceFactoryVlan.build(),
            linodeInterfaceFactoryPublic.build(),
          ],
        });
      })
    );

    const { result } = renderHook(
      () => useDetermineUnreachableIPsLinodeInterface(1, true),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv4LinodeInterface).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv6LinodeInterface).toBe(false);
    });
  });
});

describe('useDetermineUnreachableIPsConfigInterface', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('shows that public ipv4 (and ipv6) are both unreachable if Linode is "VPC only" and has no public interface', async () => {
    server.use(
      http.get('*/linode/instances/:linodeId/configs', () => {
        return HttpResponse.json(
          makeResourcePage([
            configFactory.build({
              interfaces: [
                linodeConfigInterfaceFactoryWithVPC.build({
                  primary: true,
                  ipv4: {
                    vpc: '10.0.0.0',
                    nat_1_1: undefined,
                  },
                }),
              ],
            }),
          ])
        );
      })
    );

    const { result } = renderHook(
      () => useDetermineUnreachableIPsConfigInterface(1, true),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv4ConfigInterface).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv6ConfigInterface).toBe(true);
    });
  });

  it('shows public IPv6 is not reachable if Linode has interfaces but none of them are public', async () => {
    server.use(
      http.get('*/linode/instances/:linodeId/configs', () => {
        return HttpResponse.json(
          makeResourcePage([
            configFactory.build({
              // vpc interface, not VPC only linode
              interfaces: [
                linodeConfigInterfaceFactoryWithVPC.build({
                  primary: true,
                }),
              ],
            }),
          ])
        );
      })
    );

    const { result } = renderHook(
      () => useDetermineUnreachableIPsConfigInterface(1, true),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv4ConfigInterface).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv6ConfigInterface).toBe(true);
    });
  });

  it('shows that public ipv4 (and ipv6) are both unreachable if Linode only VLAN interface', async () => {
    server.use(
      http.get('*/linode/instances/:linodeId/configs', () => {
        return HttpResponse.json(
          makeResourcePage([
            configFactory.build({
              interfaces: [linodeConfigInterfaceFactory.build()],
            }),
          ])
        );
      })
    );

    const { result } = renderHook(
      () => useDetermineUnreachableIPsConfigInterface(1, true),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv4ConfigInterface).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv6ConfigInterface).toBe(true);
    });
  });

  it('determines public IPs are reachable if Linode has no interfaces (see comments in hook)', async () => {
    server.use(
      http.get('*/linode/instances/:linodeId/configs', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { result } = renderHook(
      () => useDetermineUnreachableIPsConfigInterface(1, true),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv4ConfigInterface).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.isUnreachablePublicIPv6ConfigInterface).toBe(false);
    });
  });
});
