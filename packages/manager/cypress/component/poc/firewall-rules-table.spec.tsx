import * as React from 'react';
import {
  //   firewallRuleToRowData,
  FirewallRuleTable,
} from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleTable';
// import { FirewallRulesLanding } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRulesLanding';
import { componentTests } from 'support/util/components';
import type { ExtendedFirewallRule } from 'src/features/Firewalls/FirewallDetail/Rules/firewallRuleEditor';
import '@4tw/cypress-drag-drop';

componentTests('Firewall Rules', (mount) => {
  describe('firewallRuleToRowData', () => {
    it('firewall rules mouse drag and drop', () => {
      const rules: ExtendedFirewallRule[] = [
        {
          label: 'inbound_rule_1',
          action: 'ACCEPT',
          addresses: { ipv4: ['0.0.0.0/0'], ipv6: ['::/0'] },
          originalIndex: 0,
          ports: '22',
          protocol: 'TCP',
          status: 'NOT_MODIFIED',
        },
        {
          label: 'inbound_rule_2',
          action: 'DROP',
          addresses: { ipv4: ['10.0.0.0/8'], ipv6: ['fe80::/10'] },
          originalIndex: 1,
          ports: '80',
          protocol: 'TCP',
          status: 'NOT_MODIFIED',
        },
        {
          label: 'inbound_rule_3',
          action: 'DROP',
          addresses: { ipv4: ['192.168.1.0/24'], ipv6: [] },
          originalIndex: 2,
          ports: '443',
          protocol: 'TCP',
          status: 'NOT_MODIFIED',
        },
      ];

      mount(
        <FirewallRuleTable
          {...rules}
          category="inbound"
          disabled={false}
          handlePolicyChange={() => {}}
          openRuleDrawer={() => {}}
          policy="ACCEPT"
          rulesWithStatus={rules}
          triggerCloneFirewallRule={() => {}}
          triggerDeleteFirewallRule={() => {}}
          triggerOpenRuleDrawerForEditing={() => {}}
          triggerReorder={() => {}}
          triggerUndo={() => {}}
        />
      );
      //   mount(
      //     <FirewallRulesLanding
      //       {...rules}
      //       disabled={false}
      //       policy="ACCEPT"
      //       rulesWithStatus={rules}
      //       triggerCloneFirewallRule={() => {}}
      //       triggerDeleteFirewallRule={() => {}}
      //       triggerOpenRuleDrawerForEditing={() => {}}
      //       triggerReorder={() => {}}
      //       triggerUndo={() => {}}
      //     />
      //   );
      const tableRow = 'div[aria-label="inbound Rules List"] tbody tr';
      //   const firstRow =
      //     'div[aria-label="inbound Rules List"] tbody tr:nth-child(1)';
      const secondRow =
        'div[aria-label="inbound Rules List"] tbody tr:nth-child(2)';

      cy.get(tableRow).eq(0).drag(secondRow);
    });
  });
});
