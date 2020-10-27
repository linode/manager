import { getInterfaceName } from './LinodeVLANs';
import { configFactory } from 'src/factories/config';

describe('getInterfaceName utility function', () => {
  const configs = configFactory.build({
    interfaces: {
      eth1: {
        id: 200
      },
      eth2: {
        id: 250
      }
    }
  });

  it('should return the correct interfaceName if the interface is matched', () => {
    expect(getInterfaceName(200, [configs])).toEqual('eth1');
  });

  it('should return null if the interface is not matched', () => {
    expect(getInterfaceName(350, [configs])).toEqual(null);
  });
});
