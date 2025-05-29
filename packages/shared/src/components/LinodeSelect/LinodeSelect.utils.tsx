import type { Linode } from '@linode/api-v4';
import type { DisableItemOption } from '@linode/ui';

export interface DisabledLinodeOptions {
  linodes: Linode[] | undefined;
}
/**
 * Returns Linode IDs with corresponding reason why the Linode should be disabled in the LinodeSelect component.
 *
 * @returns key/value pairs for disabled Linodes.
 * Where `key` is the Linode ID and `value` is the reason why the Linode is disabled.
 */
export const getDisabledLinodesOptions = (
  options: DisabledLinodeOptions,
  reason: string,
) => {
  const { linodes } = options;

  // Disable Linodes that do not have read/write access.
  if (linodes) {
    const disabledLinodes: Record<string, DisableItemOption> = {};

    for (const linode of linodes) {
      disabledLinodes[linode.id] = {
        reason,
      };
    }

    return disabledLinodes;
  }

  return {};
};
