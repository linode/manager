// TODO: Cypress
import {
  linodeTypeFactory,
  regionAvailabilityFactory,
  regionFactory,
} from '@linode/utilities';
import { accountFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeTypes } from 'support/intercepts/linodes';
import {
  mockGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
// Move this to cypress component testing once the setup is complete - see https://github.com/linode/manager/pull/10134
import { ui } from 'support/ui';

const mockRegions = [
  regionFactory.build({
    capabilities: ['Linodes', 'Kubernetes'],
    id: 'us-east',
    label: 'Newark, NJ',
  }),
];

const mockDedicatedLinodeTypes = [
  linodeTypeFactory.build({
    class: 'dedicated',
    id: 'dedicated-1',
    label: 'dedicated-1',
  }),
  linodeTypeFactory.build({
    class: 'dedicated',
    id: 'dedicated-2',
    label: 'dedicated-2',
  }),
  linodeTypeFactory.build({
    class: 'dedicated',
    id: 'dedicated-3',
    label: 'dedicated-3',
  }),
  linodeTypeFactory.build({
    class: 'dedicated',
    id: 'dedicated-4',
    label: 'dedicated-4',
  }),
];

const mockSharedLinodeTypes = [
  linodeTypeFactory.build({
    class: 'standard',
    id: 'shared-1',
    label: 'shared-1',
  }),
  linodeTypeFactory.build({
    class: 'standard',
    id: 'shared-2',
    label: 'shared-2',
  }),
  linodeTypeFactory.build({
    class: 'standard',
    id: 'shared-3',
    label: 'shared-3',
  }),
];

const mockHighMemoryLinodeTypes = [
  linodeTypeFactory.build({
    class: 'highmem',
    id: 'highmem-1',
    label: 'highmem-1',
  }),
];

const mockGPUType = [
  linodeTypeFactory.build({
    class: 'gpu',
    id: 'gpu-1',
    label: 'gpu-1',
  }),
  linodeTypeFactory.build({
    class: 'gpu',
    id: 'gpu-2',
    label: 'gpu-2 Ada',
  }),
];

const mockAcceleratedType = [
  linodeTypeFactory.build({
    class: 'accelerated',
    id: 'accelerated-1',
    label: 'accelerated-1',
  }),
];

const mockLinodeTypes = [
  ...mockDedicatedLinodeTypes,
  ...mockHighMemoryLinodeTypes,
  ...mockSharedLinodeTypes,
  ...mockGPUType,
  ...mockAcceleratedType,
];

const mockRegionAvailability = [
  regionAvailabilityFactory.build({
    available: false,
    plan: 'dedicated-3',
    region: 'us-east',
  }),
  regionAvailabilityFactory.build({
    available: false,
    plan: 'dedicated-4',
    region: 'us-east',
  }),
  regionAvailabilityFactory.build({
    available: false,
    plan: 'highmem-1',
    region: 'us-east',
  }),
  regionAvailabilityFactory.build({
    available: false,
    plan: 'shared-3',
    region: 'us-east',
  }),
];

const linodePlansPanel = '[data-qa-tp="Linode Plan"]';
const k8PlansPanel = '[data-qa-tp="Add Node Pools"]';
const planSelectionTable = 'List of Linode Plans';

const notices = {
  limitedAvailability: '[data-testid="limited-availability-banner"]',
  unavailable: '[data-qa-error="true"]',
};

authenticate();
describe('displays linode plans panel based on availability', () => {
  beforeEach(() => {
    mockGetRegions(mockRegions).as('getRegions');
    mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
    mockGetRegionAvailability(mockRegions[0].id, mockRegionAvailability).as(
      'getRegionAvailability'
    );
  });

  it('displays the proper plans based on the region and types', () => {
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions', '@getLinodeTypes']);

    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();

    cy.wait(['@getRegionAvailability']);

    // Dedicated CPU tab
    // Should be selected/open by default
    // Should have the limited availability notice
    // Should contain 5 plans (6 rows including the header row)
    // Should have 3 plans disabled
    // Should not have tooltips for the disabled plans (more than half disabled plans in the panel)
    cy.get(linodePlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.limitedAvailability).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 6);
        cy.get('[id="dedicated-1"]').should('be.enabled');
        cy.get('[id="dedicated-2"]').should('be.enabled');
        cy.get(
          '[aria-label="dedicated-3 - This plan has limited deployment availability."]'
        );
        cy.get('[id="dedicated-3"]').should('be.disabled');
        cy.get('[id="g6-dedicated-64"]').should('be.disabled');
        cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
      });
    });

    // Shared CPU tab
    // Should have no notices
    // Should contain 3 plans (4 rows including the header row)
    // Should have 1 disabled plan
    // Should have one tooltip for the disabled plan
    cy.findByText('Shared CPU').click();
    cy.get(linodePlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 0);

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 4);
        cy.get('[id="shared-1"]').should('be.enabled');
        cy.get('[id="shared-2"]').should('be.enabled');
        cy.get('[id="shared-3"]').should('be.disabled');
        cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 1);
      });
    });

    // High Memory tab
    // Should have the limited availability notice
    // Should contain 1 plan (2 rows including the header row)
    // Should have one disabled plan
    // Should have no tooltip for the disabled plan (more than half disabled plans in the panel)
    cy.findByText('High Memory').click();
    cy.get(linodePlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.limitedAvailability).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[id="highmem-1"]').should('be.disabled');
        cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
      });
    });

    // Premium CPU
    // Should have the unavailable notice
    // Only present since we manually inject the 512 plan for it
    // Should contain 1 plan (2 rows including the header row)
    // Should have its whole panel disabled
    // Should not have tooltip for the disabled plan (not needed on disabled panels)
    cy.findByText('Premium CPU').click();
    cy.get(linodePlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.unavailable).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[id="g7-premium-64"]').should('be.disabled');
        cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
      });
    });
  });
});

describe('displays kubernetes plans panel based on availability', () => {
  beforeEach(() => {
    mockGetRegions(mockRegions).as('getRegions');
    mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
    mockGetRegionAvailability(mockRegions[0].id, mockRegionAvailability).as(
      'getRegionAvailability'
    );
  });

  it('displays the proper plans based on the region and types', () => {
    cy.visitWithLogin('/kubernetes/create');
    cy.wait(['@getRegions', '@getLinodeTypes']);

    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();

    cy.wait(['@getRegionAvailability']);

    // Dedicated CPU tab
    // Should be selected/open by default
    // Should have the limited availability notice
    // Should contain 5 plans (6 rows including the header row)
    // Should have 3 plans disabled
    // Should have no tooltips for the disabled plans (more than half disabled plans in the panel)
    // All inputs for a row should be enabled if row is enabled (only testing one row in suite)
    // All inputs for a disabled row should be disabled (only testing one row in suite)
    cy.get(k8PlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.limitedAvailability).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 6);
        cy.get('[data-qa-plan-row="dedicated-1"]').should(
          'not.have.attr',
          'disabled'
        );
        cy.get('[data-qa-plan-row="dedicated-2"]').should(
          'not.have.attr',
          'disabled'
        );
        cy.get('[data-qa-plan-row="dedicated-3"]').should(
          'have.attr',
          'disabled'
        );
        cy.get('[data-qa-plan-row="Dedicated 512 GB"]').should(
          'have.attr',
          'disabled'
        );
        cy.get('[data-qa-plan-row="dedicated-3"]').within(() => {
          cy.get('[data-testid="decrement-button"]').should('be.disabled');
          cy.get('[data-testid="increment-button"]').should('be.disabled');
          cy.get('[data-testid="button"]')
            .should(
              'have.attr',
              'aria-label',
              'This plan has limited deployment availability.'
            )
            .should('be.disabled');
        });
        cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
      });
    });

    // Shared CPU tab
    // Should have no notices
    // Should contain 3 plans (4 rows including the header row)
    // Should have 2 disabled plans
    // Should have tooltip for the disabled plan (not more than half disabled plans in the panel)
    cy.findByText('Shared CPU').click();
    cy.get(k8PlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 0);

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 4);
        cy.get('[data-qa-plan-row="shared-1"]').should(
          'not.have.attr',
          'disabled'
        );
        cy.get('[data-qa-plan-row="shared-2"]').should(
          'not.have.attr',
          'disabled'
        );
        cy.get('[data-qa-plan-row="shared-3"]').should('have.attr', 'disabled');
        cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 1);
      });
    });

    // High Memory tab
    // Should have the limited availability notice
    // Should contain 1 plan (2 rows including the header row)
    // Should have one disabled plan
    // Should have no tooltip for the disabled plan (more than half disabled plans in the panel)
    cy.findByText('High Memory').click();
    cy.get(k8PlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.limitedAvailability).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[data-qa-plan-row="highmem-1"]').should(
          'have.attr',
          'disabled'
        );
        cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
      });
    });

    // Premium CPU
    // Should have the unavailable notice
    // Only present since we manually inject the 512 plan for it
    // Should contain 1 plan (2 rows including the header row)
    // Should have its whole panel disabled
    // Should not have tooltip for the disabled plan (not needed on disabled panels)
    cy.findByText('Premium CPU').click();
    cy.get(k8PlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.unavailable).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[data-qa-plan-row="Premium 512 GB"]').should(
          'have.attr',
          'disabled'
        );
        cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
      });
    });
  });
});

describe('displays specific linode plans for GPU', () => {
  beforeEach(() => {
    mockGetRegions(mockRegions).as('getRegions');
    mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
    mockGetRegionAvailability(mockRegions[0].id, mockRegionAvailability).as(
      'getRegionAvailability'
    );
    mockAppendFeatureFlags({
      gpuv2: {
        egressBanner: true,
        planDivider: true,
        transferBanner: true,
      },
    }).as('getFeatureFlags');
  });

  it('Should render divided tables when GPU divider enabled', () => {
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions', '@getLinodeTypes', '@getFeatureFlags']);
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();

    // GPU tab
    // Should display two separate tables
    cy.findByText('GPU').click();
    cy.get(linodePlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 3);
      cy.get(notices.unavailable).should('be.visible');

      cy.findByRole('table', {
        name: 'List of NVIDIA RTX 4000 Ada Plans',
      }).within(() => {
        cy.findByText('NVIDIA RTX 4000 Ada').should('be.visible');
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[id="gpu-2"]').should('be.disabled');
      });

      cy.findByRole('table', {
        name: 'List of NVIDIA Quadro RTX 6000 Plans',
      }).within(() => {
        cy.findByText('NVIDIA Quadro RTX 6000').should('be.visible');
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[id="gpu-1"]').should('be.disabled');
      });
    });
  });
});

describe('displays specific kubernetes plans for GPU', () => {
  beforeEach(() => {
    mockGetRegions(mockRegions).as('getRegions');
    mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
    mockGetRegionAvailability(mockRegions[0].id, mockRegionAvailability).as(
      'getRegionAvailability'
    );
    mockAppendFeatureFlags({
      gpuv2: {
        egressBanner: true,
        planDivider: true,
        transferBanner: true,
      },
    }).as('getFeatureFlags');
  });

  it('Should render divided tables when GPU divider enabled', () => {
    cy.visitWithLogin('/kubernetes/create');
    cy.wait(['@getRegions', '@getLinodeTypes', '@getFeatureFlags']);
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();

    // GPU tab
    // Should display two separate tables
    cy.findByText('GPU').click();
    cy.get(k8PlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 2);
      cy.get(notices.unavailable).should('be.visible');

      cy.findByRole('table', {
        name: 'List of NVIDIA RTX 4000 Ada Plans',
      }).within(() => {
        cy.findByText('NVIDIA RTX 4000 Ada').should('be.visible');
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[data-qa-plan-row="gpu-2 Ada"]').should(
          'have.attr',
          'disabled'
        );
      });

      cy.findByRole('table', {
        name: 'List of NVIDIA Quadro RTX 6000 Plans',
      }).within(() => {
        cy.findByText('NVIDIA Quadro RTX 6000').should('be.visible');
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[data-qa-plan-row="gpu-1"]').should('have.attr', 'disabled');
      });
    });
  });
});

describe('Linode Accelerated plans', () => {
  beforeEach(() => {
    mockGetRegions(mockRegions).as('getRegions');
    mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
    mockGetRegionAvailability(mockRegions[0].id, mockRegionAvailability).as(
      'getRegionAvailability'
    );
  });

  describe('without necessary account capability', () => {
    beforeEach(() => {
      mockGetAccount(
        accountFactory.build({
          capabilities: [],
        })
      ).as('getAccount');
      mockAppendFeatureFlags({
        acceleratedPlans: {
          linodePlans: true,
          lkePlans: true,
        },
      }).as('getFeatureFlags');
    });

    it('should not render accelerated plans for linodes', () => {
      cy.visitWithLogin('/linodes/create');
      cy.wait([
        '@getRegions',
        '@getLinodeTypes',
        '@getAccount',
        '@getFeatureFlags',
      ]);

      cy.findByText('Accelerated').should('not.exist');
    });

    it('should not render accelerated plans for kubernetes', () => {
      cy.visitWithLogin('/kubernetes/create');
      cy.wait([
        '@getRegions',
        '@getLinodeTypes',
        '@getAccount',
        '@getFeatureFlags',
      ]);

      cy.findByText('Accelerated').should('not.exist');
    });
  });

  describe('with necessary account capability', () => {
    beforeEach(() => {
      mockGetAccount(
        accountFactory.build({
          capabilities: ['NETINT Quadra T1U'],
        })
      ).as('getAccount');
    });

    describe('Linodes plans panel', () => {
      it('should render Accelerated plans when the feature flag is on', () => {
        mockAppendFeatureFlags({
          acceleratedPlans: {
            linodePlans: true,
            lkePlans: false,
          },
        }).as('getFeatureFlags');
        cy.visitWithLogin('/linodes/create');
        cy.wait([
          '@getRegions',
          '@getLinodeTypes',
          '@getAccount',
          '@getFeatureFlags',
        ]);

        ui.regionSelect.find().click();
        ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();

        cy.findByText('Accelerated').click();
        cy.get(linodePlansPanel).within(() => {
          cy.findAllByRole('alert').should('have.length', 2);

          cy.findByRole('table', {
            name: 'List of Linode Plans',
          }).within(() => {
            cy.findByText('NETINT Quadra T1U').should('be.visible');
            cy.findAllByRole('row').should('have.length', 2);
            cy.get('[id="accelerated-1"]').should('be.disabled');
          });
        });
      });

      it('should not render Accelerated plans when the feature flag is off', () => {
        mockAppendFeatureFlags({
          acceleratedPlans: {
            linodePlans: false,
            lkePlans: false,
          },
        }).as('getFeatureFlags');
        cy.visitWithLogin('/linodes/create');
        cy.wait([
          '@getRegions',
          '@getLinodeTypes',
          '@getAccount',
          '@getFeatureFlags',
        ]);

        // Confirms Accelerated tab does not show up for linodes
        cy.findByText('Accelerated').should('not.exist');
      });
    });

    describe('kubernetes plans panel', () => {
      it('should render Accelerated plans when the feature flag is on', () => {
        mockAppendFeatureFlags({
          acceleratedPlans: {
            linodePlans: false,
            lkePlans: true,
          },
        }).as('getFeatureFlags');
        cy.visitWithLogin('/kubernetes/create');
        cy.wait([
          '@getRegions',
          '@getLinodeTypes',
          '@getAccount',
          '@getFeatureFlags',
        ]);

        ui.regionSelect.find().click();
        ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();

        cy.wait(['@getRegionAvailability']);

        cy.findByText('Accelerated').click();
        cy.get(k8PlansPanel).within(() => {
          cy.findAllByRole('alert').should('have.length', 2);

          cy.findByRole('table', { name: planSelectionTable }).within(() => {
            cy.findAllByRole('row').should('have.length', 2);
            cy.get('[data-qa-plan-row="accelerated-1"]').should('be.visible');
          });
        });
      });

      it('should not render Accelerated plans when the feature flag is off', () => {
        mockAppendFeatureFlags({
          acceleratedPlans: {
            linodePlans: false,
            lkePlans: false,
          },
        }).as('getFeatureFlags');
        cy.visitWithLogin('/kubernetes/create');
        cy.wait([
          '@getRegions',
          '@getLinodeTypes',
          '@getAccount',
          '@getFeatureFlags',
        ]);

        // Confirms Accelerated tab does not show up for LKE clusters
        cy.findByText('Accelerated').should('not.exist');
      });
    });
  });
});
