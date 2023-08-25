// import * as React from 'react';

// import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

// import {
//   FirewallDeviceLanding,
//   FirewallDeviceLandingProps,
// } from './FirewallDeviceLanding';

// const linodeProps: FirewallDeviceLandingProps = {
//   disabled: false,
//   firewallID: 1,
//   firewallLabel: 'test',
//   type: 'linode',
// };

// const nodeBalancerProps: FirewallDeviceLandingProps = {
//   disabled: false,
//   firewallID: 2,
//   firewallLabel: 'test',
//   type: 'nodebalancer',
// };

// describe('Firewall linode device', () => {
//   it('should render', () => {
//     const { queryByText } = renderWithTheme(
//       <FirewallDeviceLanding {...linodeProps} />
//     );
//     includesActions(['Edit', 'Clone', 'Delete'], queryByText);
//   });
// });
