import { fbtClick } from 'support/helpers';
import { ui } from 'support/ui';
import {
  regionFactory,
  regionAvailabilityFactory,
  linodeTypeFactory,
} from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import {
  mockGetRegions,
  mockGetRegionAvailability,
} from 'support/intercepts/regions';
import { mockGetLinodeTypes } from 'support/intercepts/linodes';

const mockRegions = [
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-east',
    label: 'Newark, NJ',
  }),
];

const mockDedicatedLinodeTypes = [
  linodeTypeFactory.build({
    id: 'dedicated-1',
    class: 'dedicated',
  }),
  linodeTypeFactory.build({
    id: 'dedicated-2',
    class: 'dedicated',
  }),
  linodeTypeFactory.build({
    id: 'dedicated-3',
    class: 'dedicated',
  }),
];

const mockSharedLinodeTypes = [
  linodeTypeFactory.build({
    id: 'shared-1',
    class: 'standard',
  }),
  linodeTypeFactory.build({
    id: 'shared-2',
    class: 'standard',
  }),
  linodeTypeFactory.build({
    id: 'shared-3',
    class: 'standard',
  }),
];

const mockHighMemoryLinodeTypes = [
  linodeTypeFactory.build({
    id: 'highmem-1',
    class: 'highmem',
  }),
];

const mockGPUType = [
  linodeTypeFactory.build({
    id: 'gpu-1',
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
  regionAvailabilityFactory.build({
    plan: 'shared-3',
    available: false,
    region: 'us-east',
  }),
];

authenticate();
describe('displays plan selection status based on availability', () => {
  before(() => {
    cleanUp('linodes');
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
    // Should contains 4 plans (5 rows including the header row)
    // Should have 2 plans disabled
    // Should have tooltips for the disabled plans (not more than half disabled plans in the panel)
    cy.findByRole('table', { name: 'List of Linode Plans' }).within(() => {
      cy.findAllByRole('row').should('have.length', 5);
      cy.get('[id="dedicated-1"]').should('be.enabled');
      cy.get('[id="dedicated-2"]').should('be.enabled');
      cy.get('[id="dedicated-3"]').should('be.disabled');
      cy.get('[id="g6-dedicated-64"]').should('be.disabled');
      cy.findAllByTestId('limited-availability').should('have.length', 2);
    });

    // Shared CPU tab
    // Should contains 3 plans (4 rows including the header row)
    // Should have 1 disabled plan
    // Should have tooltip for the disabled plan (not more than half disabled plans in the panel)
    fbtClick('Shared CPU');
    cy.findByRole('table', { name: 'List of Linode Plans' }).within(() => {
      cy.findAllByRole('row').should('have.length', 4);
      cy.get('[id="shared-1"]').should('be.enabled');
      cy.get('[id="shared-2"]').should('be.enabled');
      cy.get('[id="shared-3"]').should('be.disabled');
      cy.findAllByTestId('limited-availability').should('have.length', 1);
    });

    // High Memory tab
    // Should contains 1 plan (2 rows including the header row)
    // Should have one disabled plan
    // Should have tooltip for the disabled plan (more than half disabled plans in the panel, but only one plan)
    fbtClick('High Memory');
    cy.findByRole('table', { name: 'List of Linode Plans' }).within(() => {
      cy.findAllByRole('row').should('have.length', 2);
      cy.get('[id="highmem-1"]').should('be.disabled');
      cy.findAllByTestId('limited-availability').should('have.length', 1);
    });

    // GPU tab
    // Should contains 1 plan (2 rows including the header row)
    // Should have its panel disabled
    // Should not have tooltip for the disabled plan (not needed on disabled panels)
    fbtClick('GPU');
    cy.findByRole('table', { name: 'List of Linode Plans' }).within(() => {
      cy.findAllByRole('row').should('have.length', 2);
      cy.get('[id="gpu-1"]').should('be.disabled');
      cy.findAllByTestId('limited-availability').should('have.length', 0);
    });

    // Premium CPU
    // Only present since we manually inject the 512 plan for it
    // Should contains 1 plan (2 rows including the header row)
    // Should have its panel disabled
    // Should not have tooltip for the disabled plan (not needed on disabled panels)
    fbtClick('Premium CPU');
    cy.findByRole('table', { name: 'List of Linode Plans' }).within(() => {
      cy.findAllByRole('row').should('have.length', 2);
      cy.get('[id="g7-premium-64"]').should('be.disabled');
      cy.findAllByTestId('limited-availability').should('have.length', 0);
    });
  });
});
