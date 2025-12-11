import { capitalize } from '@linode/utilities';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { firewallPrefixListFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import * as shared from '../../shared';
import { FirewallPrefixListDrawer } from './FirewallPrefixListDrawer';
import * as rulesShared from './shared';
import { PREFIXLIST_MARKED_FOR_DELETION_TEXT } from './shared';

import type { FirewallPrefixListDrawerProps } from './FirewallPrefixListDrawer';
import type { FirewallPrefixList } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useAllFirewallPrefixListsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllFirewallPrefixListsQuery: queryMocks.useAllFirewallPrefixListsQuery,
  };
});

vi.mock('@linode/utilities', async () => {
  const actual = await vi.importActual('@linode/utilities');
  return {
    ...actual,
    getUserTimezone: vi.fn().mockReturnValue('utc'),
  };
});

const spy = vi.spyOn(shared, 'useIsFirewallRulesetsPrefixlistsEnabled');
const combineSpy = vi.spyOn(rulesShared, 'combinePrefixLists');

//
// Helper to compute expected UI values/text
//
const computeExpectedElements = (
  category: 'inbound' | 'outbound',
  context: FirewallPrefixListDrawerProps['context']
) => {
  let title = 'Prefix List details';
  let button = 'Close';
  let label = 'Name:';
  let hasBackNavigation = false;

  if (context?.type === 'ruleset' && context.modeViewedFrom === 'create') {
    title = `Add an ${capitalize(category)} Rule or Rule Set`;
    button = `Back to ${capitalize(category)} Rule Set`;
    label = 'Prefix List Name:';
    hasBackNavigation = true;
  }

  if (context?.type === 'rule' && context.modeViewedFrom === 'create') {
    title = `Add an ${capitalize(category)} Rule or Rule Set`;
    button = `Back to ${capitalize(category)} Rule`;
    label = 'Prefix List Name:';
    hasBackNavigation = true;
  }

  if (context?.type === 'ruleset' && context.modeViewedFrom === 'view') {
    title = `${capitalize(category)} Rule Set details`;
    button = 'Back to the Rule Set';
    label = 'Prefix List Name:';
    hasBackNavigation = true;
  }

  if (context?.type === 'rule' && context.modeViewedFrom === 'edit') {
    title = 'Edit Rule';
    button = 'Back to Rule';
    label = 'Prefix List Name:';
    hasBackNavigation = true;
  }

  // Default values when there is no specific drawer context
  // (e.g., type === 'rule' and modeViewedFrom === undefined,
  // meaning the drawer is opened directly from the Firewall Table row)
  return { title, button, label, hasBackNavigation };
};

describe('FirewallPrefixListDrawer', () => {
  beforeEach(() => {
    spy.mockReturnValue({
      isFirewallRulesetsPrefixlistsFeatureEnabled: true,
      isFirewallRulesetsPrefixListsBetaEnabled: false,
      isFirewallRulesetsPrefixListsLAEnabled: false,
      isFirewallRulesetsPrefixListsGAEnabled: false,
    });
  });

  // Default/base props
  const baseProps: Omit<FirewallPrefixListDrawerProps, 'category' | 'context'> =
    {
      isOpen: true,
      onClose: () => {},
      selectedPrefixListLabel: 'pl-test',
    };

  const drawerProps: FirewallPrefixListDrawerProps[] = [
    {
      ...baseProps,
      category: 'inbound',
      context: {
        type: 'ruleset',
        modeViewedFrom: 'create',
        plRuleRef: { inIPv4Rule: true, inIPv6Rule: true },
      },
    },
    {
      ...baseProps,
      category: 'inbound',
      context: {
        type: 'rule',
        modeViewedFrom: 'create',
        plRuleRef: { inIPv4Rule: true, inIPv6Rule: true },
      },
    },
    {
      ...baseProps,
      category: 'outbound',
      context: {
        type: 'ruleset',
        modeViewedFrom: 'view',
        plRuleRef: { inIPv4Rule: true, inIPv6Rule: false },
      },
    },
    {
      ...baseProps,
      category: 'inbound',
      context: {
        type: 'rule',
        modeViewedFrom: 'edit',
        plRuleRef: { inIPv4Rule: false, inIPv6Rule: true },
      },
    },
    {
      ...baseProps,
      category: 'outbound',
      context: {
        type: 'rule',
        plRuleRef: { inIPv4Rule: true, inIPv6Rule: true },
      },
    },
  ];

  it.each(drawerProps)(
    'renders correct UI for category:$category, contextType:$context.type and modeViewedFrom:$context.modeViewedFrom',
    ({ category, context, selectedPrefixListLabel }) => {
      const mockData = firewallPrefixListFactory.build({
        name: selectedPrefixListLabel,
      });
      queryMocks.useAllFirewallPrefixListsQuery.mockReturnValue({
        data: [mockData],
      });

      combineSpy.mockReturnValue([
        ...rulesShared.SPECIAL_PREFIX_LISTS,
        mockData,
      ]);

      const { getByText, getByRole, queryByLabelText } = renderWithTheme(
        <FirewallPrefixListDrawer
          category={category}
          context={context}
          isOpen={true}
          onClose={vi.fn()}
          selectedPrefixListLabel={selectedPrefixListLabel}
        />
      );

      // Compute expectations
      const { title, button, label, hasBackNavigation } =
        computeExpectedElements(category, context);

      // Back Navigation (only if expected)
      const backIconButton = queryByLabelText('back navigation');
      if (hasBackNavigation) {
        expect(backIconButton).toBeVisible();
      } else {
        expect(backIconButton).not.toBeInTheDocument();
      }

      // Title
      expect(getByText(title)).toBeVisible();

      // First label (Prefix List Name: OR Name:)
      expect(getByText(label)).toBeVisible();

      // Static detail labels
      [
        'ID:',
        'Description:',
        'Type:',
        'Visibility:',
        'Version:',
        'Created:',
        'Updated:',
      ].forEach((l) => expect(getByText(l)).toBeVisible());

      // Back or Cancel button
      expect(getByRole('button', { name: button })).toBeVisible();
    }
  );

  // Marked for deletion tests
  const deletionTestCases = [
    [
      'should not display "Marked for deletion" when prefix list is active',
      null,
    ],
    [
      'should display "Marked for deletion" when prefix list is deleted',
      '2025-07-24T04:23:17',
    ],
  ];

  it.each(deletionTestCases)('%s', async (_, deletedTimeStamp) => {
    const mockPrefixList = firewallPrefixListFactory.build({
      name: 'pl-test',
      deleted: deletedTimeStamp,
    });

    queryMocks.useAllFirewallPrefixListsQuery.mockReturnValue({
      data: [mockPrefixList],
    });
    combineSpy.mockReturnValue([
      ...rulesShared.SPECIAL_PREFIX_LISTS,
      mockPrefixList,
    ]);

    const { getByText, getByTestId, findByText, queryByText } = renderWithTheme(
      <FirewallPrefixListDrawer
        category="inbound"
        context={{
          type: 'rule',
          plRuleRef: { inIPv4Rule: false, inIPv6Rule: true },
        }}
        isOpen={true}
        onClose={vi.fn()}
        selectedPrefixListLabel="pl-test"
      />
    );

    if (deletedTimeStamp) {
      expect(getByText('Marked for deletion:')).toBeVisible();
      const tooltip = getByTestId('tooltip-info-icon');
      await userEvent.hover(tooltip);
      expect(
        await findByText(PREFIXLIST_MARKED_FOR_DELETION_TEXT)
      ).toBeVisible();
    } else {
      expect(queryByText('Marked for deletion:')).not.toBeInTheDocument();
    }
  });

  const prefixListVariants: Partial<FirewallPrefixList>[] = [
    { name: 'pl::supports-both', ipv4: ['1.1.1.0/24'], ipv6: ['::1/128'] },
    { name: 'pl::supports-only-ipv4', ipv4: ['1.1.1.0/24'], ipv6: null },
    { name: 'pl::supports-only-ipv6', ipv4: null, ipv6: ['::1/128'] },
    { name: 'pl::supports-both-but-ipv4-empty', ipv4: [], ipv6: ['::1/128'] },
    {
      name: 'pl::supports-both-but-ipv6-empty',
      ipv4: ['1.1.1.0/24'],
      ipv6: [],
    },
    { name: 'pl::supports-both-but-both-empty', ipv4: [], ipv6: [] },
  ];

  const ruleReferences: FirewallPrefixListDrawerProps['context'][] = [
    { plRuleRef: { inIPv4Rule: true, inIPv6Rule: false }, type: 'rule' },
    { plRuleRef: { inIPv4Rule: false, inIPv6Rule: true }, type: 'rule' },
    { plRuleRef: { inIPv4Rule: true, inIPv6Rule: true }, type: 'rule' },
    { plRuleRef: { inIPv4Rule: true, inIPv6Rule: true }, type: 'ruleset' },
  ];

  const ipSectionTestCases = [
    // PL supports both
    {
      prefixList: prefixListVariants[0],
      context: ruleReferences[0],
      expectedIPv4: 'in use',
      expectedIPv6: 'not in use',
    },
    {
      prefixList: prefixListVariants[0],
      context: ruleReferences[1],
      expectedIPv4: 'not in use',
      expectedIPv6: 'in use',
    },
    {
      prefixList: prefixListVariants[0],
      context: ruleReferences[2],
      expectedIPv4: 'in use',
      expectedIPv6: 'in use',
    },
    {
      prefixList: prefixListVariants[0],
      context: ruleReferences[3],
      expectedIPv4: 'in use',
      expectedIPv6: 'in use',
    },
    // PL supports only IPv4
    {
      prefixList: prefixListVariants[1],
      context: ruleReferences[0],
      expectedIPv4: 'in use',
    },
    // PL supports only IPv6
    {
      prefixList: prefixListVariants[2],
      context: ruleReferences[1],
      expectedIPv6: 'in use',
    },
    // PL IPv4 empty
    {
      prefixList: prefixListVariants[3],
      context: ruleReferences[0],
      expectedIPv4: 'in use',
      expectedIPv6: 'not in use',
    },
    {
      prefixList: prefixListVariants[3],
      context: ruleReferences[1],
      expectedIPv4: 'not in use',
      expectedIPv6: 'in use',
    },
    // PL IPv6 empty
    {
      prefixList: prefixListVariants[4],
      context: ruleReferences[0],
      expectedIPv4: 'in use',
      expectedIPv6: 'not in use',
    },
    {
      prefixList: prefixListVariants[4],
      context: ruleReferences[1],
      expectedIPv4: 'not in use',
      expectedIPv6: 'in use',
    },
    // PL both empty
    {
      prefixList: prefixListVariants[5],
      context: ruleReferences[0],
      expectedIPv4: 'in use',
      expectedIPv6: 'not in use',
    },
    {
      prefixList: prefixListVariants[5],
      context: ruleReferences[1],
      expectedIPv4: 'not in use',
      expectedIPv6: 'in use',
    },
  ];

  it.each(ipSectionTestCases)(
    'renders correct chip and IP addresses for Prefix List $prefixList.name with reference $context.plRuleRef',
    ({ prefixList, context, expectedIPv4, expectedIPv6 }) => {
      const selectedPrefixList = prefixList.name;

      const mockPrefixList = firewallPrefixListFactory.build({ ...prefixList });
      queryMocks.useAllFirewallPrefixListsQuery.mockReturnValue({
        data: [mockPrefixList],
      });
      combineSpy.mockReturnValue([
        ...rulesShared.SPECIAL_PREFIX_LISTS,
        mockPrefixList,
      ]);

      const { getByTestId } = renderWithTheme(
        <FirewallPrefixListDrawer
          category="inbound"
          context={context}
          isOpen={true}
          onClose={vi.fn()}
          selectedPrefixListLabel={selectedPrefixList}
        />
      );

      if (prefixList.ipv4 && expectedIPv4) {
        const ipv4Chip = getByTestId('ipv4-chip');
        expect(ipv4Chip).toBeVisible();
        expect(ipv4Chip).toHaveTextContent(expectedIPv4);

        // Check IPv4 addresses
        const ipv4Section = getByTestId('ipv4-section');
        const ipv4Content = prefixList.ipv4.length
          ? prefixList.ipv4.join(', ')
          : 'no IP addresses';
        expect(within(ipv4Section).getByText(ipv4Content)).toBeVisible();
      }

      if (prefixList.ipv6 && expectedIPv6) {
        const ipv6Chip = getByTestId('ipv6-chip');
        expect(ipv6Chip).toBeVisible();
        expect(ipv6Chip).toHaveTextContent(expectedIPv6);

        // Check IPv6 addresses
        const ipv6Section = getByTestId('ipv6-section');
        const ipv6Content = prefixList.ipv6.length
          ? prefixList.ipv6.join(', ')
          : 'no IP addresses';
        expect(within(ipv6Section).getByText(ipv6Content)).toBeVisible();
      }
    }
  );
});

describe('FirewallPrefixListDrawer - Special "<current>" Prefix Lists', () => {
  beforeEach(() => {
    spy.mockReturnValue({
      isFirewallRulesetsPrefixlistsFeatureEnabled: true,
      isFirewallRulesetsPrefixListsBetaEnabled: false,
      isFirewallRulesetsPrefixListsLAEnabled: false,
      isFirewallRulesetsPrefixListsGAEnabled: false,
    });
  });
  const specialPrefixListDescription =
    'System-defined PrefixLists, such as pl::vpcs:<current> and pl::subnets:<current>, for VPC interface firewalls are dynamic and update automatically. They manage access to and from the interface for addresses within the interface’s VPC or VPC subnet.';
  const plRuleRef = { inIPv4Rule: true, inIPv6Rule: true };
  const context: FirewallPrefixListDrawerProps['context'][] = [
    {
      type: 'rule',
      plRuleRef,
    },
    {
      modeViewedFrom: 'create',
      type: 'ruleset',
      plRuleRef,
    },
    { modeViewedFrom: 'edit', type: 'rule', plRuleRef },
    { modeViewedFrom: 'view', type: 'ruleset', plRuleRef },
  ];
  const specialPLsTestCases = [
    {
      name: 'pl::vpcs:<current>',
      description: specialPrefixListDescription,
      context: context[0],
    },
    {
      name: 'pl::subnets:<current>',
      description: specialPrefixListDescription,
      context: context[1],
    },
    {
      name: 'pl::vpcs:<current>',
      description: specialPrefixListDescription,
      context: context[2],
    },
    {
      name: 'pl::subnets:<current>',
      description: specialPrefixListDescription,
      context: context[3],
    },
  ];

  it.each(specialPLsTestCases)(
    'renders only Name and Description for special PL: $name, contextType: $context.type and modeViewedFrom: $context.modeViewedFrom',
    ({ name, description, context }) => {
      // API returns no matches, special PL logic must handle it
      queryMocks.useAllFirewallPrefixListsQuery.mockReturnValue({
        data: [],
      });
      combineSpy.mockReturnValue([...rulesShared.SPECIAL_PREFIX_LISTS]);

      const { getByText, queryByText } = renderWithTheme(
        <FirewallPrefixListDrawer
          category="inbound"
          context={context}
          isOpen={true}
          onClose={vi.fn()}
          selectedPrefixListLabel={name}
        />
      );

      const { label } = computeExpectedElements('inbound', context);

      // Name and Description should be visible
      expect(getByText(label)).toBeVisible(); // First label (Prefix List Name: OR Name:)
      expect(getByText(name)).toBeVisible();

      expect(getByText('Description:')).toBeVisible();
      expect(getByText(description)).toBeVisible();

      // All other fields must be hidden
      const hiddenFields = [
        'ID:',
        'Type:',
        'Visibility:',
        'Version:',
        'Created:',
        'Updated:',
      ];

      hiddenFields.forEach((label) => {
        expect(queryByText(label)).not.toBeInTheDocument();
      });
    }
  );
});
