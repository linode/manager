import {
  LinodeConfigInterfaceFactoryWithVPC,
  configFactory,
} from 'src/factories';

import { manuallySetVPCConfigInterfacesToActive } from './configs';

describe('manually setting VPC Configs to active', () => {
  it('sets all vpc interfaces to active', () => {
    const config = configFactory.build({
      interfaces: LinodeConfigInterfaceFactoryWithVPC.buildList(3),
    });
    const updatedConfigs = manuallySetVPCConfigInterfacesToActive([config]);

    if (updatedConfigs[0].interfaces) {
      for (const linodeInterface of updatedConfigs[0].interfaces) {
        expect(linodeInterface.active).toBe(true);
      }
    }
  });
  it('ignores non vpc interfaces', () => {
    const config = configFactory.build();
    const oldConfigState = { ...config };
    const updatedConfigs = manuallySetVPCConfigInterfacesToActive([config]);
    if (updatedConfigs[0].interfaces) {
      for (let i = 0; i < updatedConfigs[0].interfaces.length; i++) {
        const linodeInterface = updatedConfigs[0].interfaces[i];
        if (linodeInterface.purpose !== 'vpc') {
          expect(linodeInterface.active).toEqual(
            oldConfigState.interfaces?.[i].active
          );
        } else {
          expect(linodeInterface.active).toBe(true);
        }
      }
    }
  });
});
