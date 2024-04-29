import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetPlacementGroups } from 'support/intercepts/vm-placement';
import { ui } from 'support/ui';
import { accountFactory } from 'src/factories';

import type { Flags } from 'src/featureFlags';
import { mockGetAccount } from 'support/intercepts/account';

const mockAccount = accountFactory.build();

describe('VM Placement landing page', () => {
  // Mock the VM Placement Groups feature flag to be enabled for each test in this block.
  beforeEach(() => {
    mockAppendFeatureFlags({
      placementGroups: makeFeatureFlagData<Flags['placementGroups']>({
        beta: true,
        enabled: true,
      }),
    });
    mockGetFeatureFlagClientstream();
    mockGetAccount(mockAccount).as('getAccount');
  });

  /**
   * - Confirms landing page empty state is shown when there are no Placement Groups.
   * - Confirms that clicking "Create Placement Groups" opens PG create drawer.
   */
  it('displays empty state when there are no Placement Groups', () => {
    mockGetPlacementGroups([]).as('getPlacementGroups');
    cy.visitWithLogin('/placement-groups');
    cy.wait('@getPlacementGroups');

    ui.heading.find().within(() => {
      cy.findByText('Placement Groups').should('be.visible');
    });

    ui.button
      .findByTitle('Create Placement Groups')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer.findByTitle('Create Placement Group').should('be.visible');
  });
});
