// TODO: Cypress
// Move this to cypress component testing once the setup is complete - see https://github.com/linode/manager/pull/10134
import { fbtClick } from 'support/helpers';
import { ui } from 'support/ui';
import {
  regionFactory,
  regionAvailabilityFactory,
  linodeTypeFactory,
} from '@src/factories';
import { authenticate } from 'support/api/authentication';
import {
  mockGetRegions,
  mockGetRegionAvailability,
} from 'support/intercepts/regions';
import { mockGetLinodeTypes } from 'support/intercepts/linodes';

const mockRegions = [
  regionFactory.build({
    capabilities: ['Linodes', 'Kubernetes'],
    id: 'us-east',
    label: 'Newark, NJ',
  }),
];

const mockDedicatedLinodeTypes = [
  linodeTypeFactory.build({
    id: 'dedicated-1',
    label: 'dedicated-1',
    class: 'dedicated',
  }),
  linodeTypeFactory.build({
    id: 'dedicated-2',
    label: 'dedicated-2',
    class: 'dedicated',
  }),
  linodeTypeFactory.build({
    id: 'dedicated-3',
    label: 'dedicated-3',
    class: 'dedicated',
  }),
];

const mockSharedLinodeTypes = [
  linodeTypeFactory.build({
    id: 'shared-1',
    label: 'shared-1',
    class: 'standard',
  }),
  linodeTypeFactory.build({
    id: 'shared-2',
    label: 'shared-2',
    class: 'standard',
  }),
  linodeTypeFactory.build({
    id: 'shared-3',
    label: 'shared-3',
    class: 'standard',
  }),
];

const mockHighMemoryLinodeTypes = [
  linodeTypeFactory.build({
    id: 'highmem-1',
    label: 'highmem-1',
    class: 'highmem',
  }),
];

const mockGPUType = [
  linodeTypeFactory.build({
    id: 'gpu-1',
    label: 'gpu-1',
    class: 'gpu',
  }),
];

const mockLinodeTypes = [
  ...mockDedicatedLinodeTypes,
  ...mockHighMemoryLinodeTypes,
  ...mockSharedLinodeTypes,
  ...mockGPUType,
];

const mockRegionAvailability = [
  regionAvailabilityFactory.build({
    plan: 'dedicated-3',
    available: false,
    region: 'us-east',
  }),
  regionAvailabilityFactory.build({
    plan: 'highmem-1',
    available: false,
    region: 'us-east',
  }),
];

const linodePlansPanel = '[data-qa-tp="Linode Plan"]';
const k8PlansPanel = '[data-qa-tp="Add Node Pools"]';
const planSelectionTable = 'List of Linode Plans';

const notices = {
  limitedAvailability: '[data-testid="limited-availability"]',
  unavailable: '[data-testid="notice-error"]',
};

authenticate();
describe('displays linode plans panel based on availability', () => {
  before(() => {
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
    // Should contains 4 plans (5 rows including the header row)
    // Should have 2 plans disabled
    // Should have tooltips for the disabled plans (not more than half disabled plans in the panel)
    cy.get(linodePlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.limitedAvailability).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 5);
        cy.get('[id="dedicated-1"]').should('be.enabled');
        cy.get('[id="dedicated-2"]').should('be.enabled');
        cy.get('[id="dedicated-3"]').should('be.disabled');
        cy.get('[id="g6-dedicated-64"]').should('be.disabled');
        cy.findAllByTestId('limited-availability').should('have.length', 2);
      });
    });

    // Shared CPU tab
    // Should have no notices
    // Should contains 3 plans (4 rows including the header row)
    // Should have 0 disabled plan
    // Should have no tooltip for the disabled plan
    fbtClick('Shared CPU');
    cy.get(linodePlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 0);

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 4);
        cy.get('[id="shared-1"]').should('be.enabled');
        cy.get('[id="shared-2"]').should('be.enabled');
        cy.get('[id="shared-3"]').should('be.enabled');
        cy.findAllByTestId('limited-availability').should('have.length', 0);
      });
    });

    // High Memory tab
    // Should have the limited availability notice
    // Should contains 1 plan (2 rows including the header row)
    // Should have one disabled plan
    // Should have tooltip for the disabled plan (more than half disabled plans in the panel, but only one plan)
    fbtClick('High Memory');
    cy.get(linodePlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.limitedAvailability).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[id="highmem-1"]').should('be.disabled');
        cy.findAllByTestId('limited-availability').should('have.length', 1);
      });
    });

    // GPU tab
    // Should have the unavailable notice
    // Should contains 1 plan (2 rows including the header row)
    // Should have its panel disabled
    // Should not have tooltip for the disabled plan (not needed on disabled panels)
    fbtClick('GPU');
    cy.get(linodePlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.unavailable).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[id="gpu-1"]').should('be.disabled');
        cy.findAllByTestId('limited-availability').should('have.length', 0);
      });
    });

    // Premium CPU
    // Should have the unavailable notice
    // Only present since we manually inject the 512 plan for it
    // Should contains 1 plan (2 rows including the header row)
    // Should have its whole panel disabled
    // Should not have tooltip for the disabled plan (not needed on disabled panels)
    fbtClick('Premium CPU');
    cy.get(linodePlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.unavailable).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[id="g7-premium-64"]').should('be.disabled');
        cy.findAllByTestId('limited-availability').should('have.length', 0);
      });
    });
  });
});

describe('displays kubernetes plans panel based on availability', () => {
  before(() => {
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
    // Should contains 4 plans (5 rows including the header row)
    // Should have 2 plans disabled
    // Should have tooltips for the disabled plans (not more than half disabled plans in the panel)
    // All inputs for a row should be enabled if row is enabled (only testing one row in suite)
    // All inputs for a disabled row should be disabled (only testing one row in suite)
    cy.get(k8PlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.limitedAvailability).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 5);
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
          cy.findByRole('button', { name: 'Add' }).should('be.disabled');
        });
        cy.findAllByTestId('limited-availability').should('have.length', 2);
      });
    });

    // Shared CPU tab
    // Should have no notices
    // Should contains 3 plans (4 rows including the header row)
    // Should have 1 disabled plan
    // Should have tooltip for the disabled plan (not more than half disabled plans in the panel)
    fbtClick('Shared CPU');
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
        cy.get('[data-qa-plan-row="shared-3"]').should(
          'not.have.attr',
          'disabled'
        );
        cy.findAllByTestId('limited-availability').should('have.length', 0);
      });
    });

    // High Memory tab
    // Should have the limited availability notice
    // Should contains 1 plan (2 rows including the header row)
    // Should have one disabled plan
    // Should have tooltip for the disabled plan (more than half disabled plans in the panel, but only one plan)
    fbtClick('High Memory');
    cy.get(k8PlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.limitedAvailability).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[data-qa-plan-row="highmem-1"]').should(
          'have.attr',
          'disabled'
        );
        cy.findAllByTestId('limited-availability').should('have.length', 1);
      });
    });

    // Premium CPU
    // Should have the unavailable notice
    // Only present since we manually inject the 512 plan for it
    // Should contains 1 plan (2 rows including the header row)
    // Should have its whole panel disabled
    // Should not have tooltip for the disabled plan (not needed on disabled panels)
    fbtClick('Premium CPU');
    cy.get(k8PlansPanel).within(() => {
      cy.findAllByRole('alert').should('have.length', 1);
      cy.get(notices.unavailable).should('be.visible');

      cy.findByRole('table', { name: planSelectionTable }).within(() => {
        cy.findAllByRole('row').should('have.length', 2);
        cy.get('[data-qa-plan-row="Premium 512 GB"]').should(
          'have.attr',
          'disabled'
        );
        cy.findAllByTestId('limited-availability').should('have.length', 0);
      });
    });
  });
});
