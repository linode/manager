// import * as React from 'react';

// import { firewallDeviceFactory } from 'src/factories';
// import { renderWithTheme } from 'src/utilities/testHelpers';

// import { FirewallDeviceTable } from './FirewallDeviceTable';

// import type { FirewallDeviceTableProps } from './FirewallDeviceTable';
// import type { FirewallDeviceEntityType } from '@linode/api-v4';

// const devices = ['linode', 'nodebalancer'];

// const props = (type: FirewallDeviceEntityType): FirewallDeviceTableProps => ({
//   deviceType: type,
//   devices: firewallDeviceFactory.buildList(2),
//   disabled: false,
//   error: undefined,
//   loading: false,
//   triggerRemoveDevice: vi.fn(),
// });

// devices.forEach((device: FirewallDeviceEntityType) => {
//   describe(`Firewall ${device} table`, () => {
//     it(`should render`, () => {
//       const { getByRole } = renderWithTheme(
//         <FirewallDeviceTable {...props(device)} />
//       );
//       const table = getByRole('table');
//       expect(table).toBeInTheDocument();
//     });
//   });

//   it(`should contain two rows`, () => {
//     const { getAllByRole } = renderWithTheme(
//       <FirewallDeviceTable {...props(device)} />
//     );
//     const rows = getAllByRole('row');
//     expect(rows.length - 1).toBe(2);
//   });
// });
