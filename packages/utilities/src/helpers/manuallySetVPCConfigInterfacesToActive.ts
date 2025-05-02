import type { Config } from '@linode/api-v4';

// This is a helper function to manually set interfaces related to VPCs to active. We call this function when rebooting/booting linodes; we specifically set the react queryCache
// to this in order to address the flickering 'Reboot Needed' status issue (see PR#9893).
// NOTE: This logic only works for linodes with one configuration/one vpc interface, and will lead to VERY CONFUSING results for linodes with multiple configurations.
export const manuallySetVPCConfigInterfacesToActive = (
  configs: Config[],
): Config[] => {
  return configs.map((config) => {
    return {
      ...config,
      interfaces:
        config.interfaces?.map((linodeInterface) => {
          if (linodeInterface.purpose === 'vpc') {
            return { ...linodeInterface, active: true };
          } else {
            return linodeInterface;
          }
        }) ?? null,
    };
  });
};
