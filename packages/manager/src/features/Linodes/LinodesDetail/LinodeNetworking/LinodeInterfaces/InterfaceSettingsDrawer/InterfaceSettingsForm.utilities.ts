import type { LinodeInterfaces, LinodeInterfaceSettings } from '@linode/api-v4';
import type { DisableItemOption } from '@linode/ui';

/**
 *
 * @returns Key value pairs for interfaces that are not eligible to be default routes.
 * The key is the interface ID and the value is the reason the option is disabled.
 */
export function getDisabledInterfaceSelectOptions(
  interfaces: LinodeInterfaces,
  interfaceSettings: LinodeInterfaceSettings,
  type: 'IPv4' | 'IPv6'
) {
  const disabledOptions: Record<number, DisableItemOption> = {};

  const defaultRouteKey =
    type === 'IPv4'
      ? 'ipv4_eligible_interface_ids'
      : 'ipv6_eligible_interface_ids';

  for (const i of interfaces.interfaces) {
    if (!interfaceSettings.default_route[defaultRouteKey].includes(i.id)) {
      disabledOptions[i.id] = {
        reason: `This interface is not eligible to be the default ${type} route.`,
      };
    }
  }

  return disabledOptions;
}
