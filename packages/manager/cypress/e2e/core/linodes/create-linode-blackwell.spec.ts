import {
  linodeTypeFactory,
  regionAvailabilityFactory,
  regionFactory,
} from '@linode/utilities';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeTypes } from 'support/intercepts/linodes';
// import { createLinodeRequestFactory, linodeFactory } from '@linode/utilities';
import {
  mockGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

const linodeLabels = [
  `${randomLabel()}-1`,
  `${randomLabel()}-2`,
  `${randomLabel()}-3`,
  `${randomLabel()}-4`,
];

const mockRegion = regionFactory.build({
  id: 'us-east',
  label: 'Newark, NJ',
  capabilities: [
    'GPU Linodes',
    'Linodes',
    'Kubernetes',
    'Kubernetes Enterprise',
  ],
});

describe('smoketest for Nvidia blackwell GPUs in linodes/create page', () => {
  beforeEach(() => {
    cy.wrap(mockRegion).as('mockRegion');
    mockGetRegions([mockRegion]).as('getRegions');
    const mockRegionAvailability = linodeLabels.map((planName) =>
      regionAvailabilityFactory.build({
        plan: planName,
        available: true,
        region: mockRegion.id,
      })
    );
    mockGetRegionAvailability(mockRegion.id, mockRegionAvailability).as(
      'getRegionAvailability'
    );

    // table on GPU tab populated by types w/ class = 'gpu'
    const mockLinodeTypes = linodeLabels.map((planName) =>
      linodeTypeFactory.build({
        id: `id-${randomLabel()}`,
        class: 'gpu',
        label: planName,
      })
    );
    const mockBlackwellLinodeTypes = linodeLabels.map((planName) =>
      linodeTypeFactory.build({
        id: `id-blackwell-${randomLabel()}`,
        class: 'gpu',
        label: 'blackwell-' + planName,
      })
    );
    const mockEnterpriseLinodeTypes = linodeLabels.map((planName) =>
      linodeTypeFactory.build({
        id: `id-gpu-${randomLabel()}`,

        class: 'gpu',
        label: 'gpu-' + planName,
      })
    );

    mockGetLinodeTypes([
      ...mockLinodeTypes,
      ...mockBlackwellLinodeTypes,
      ...mockEnterpriseLinodeTypes,
    ]).as('getLinodeTypes');
  });

  /*
   * Displays all GPUs w/out any filtered
   */
  it('displays all types', function () {
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions']);
    ui.regionSelect.find().click();
    ui.regionSelect.find().clear();
    ui.regionSelect.find().type(`${this.mockRegion.label}{enter}`);
    // Navigate to "GPU" tab
    cy.get('[data-qa-tp="Linode Plan"]')
      .should('be.visible')
      .within(() => {
        ui.tabList.findTabByTitle('GPU').scrollIntoView();
        ui.tabList.findTabByTitle('GPU').should('be.visible').click();
      });

    cy.findByRole('table', {
      name: 'List of NVIDIA Quadro RTX 6000 Plans',
    }).within(() => {
      cy.findByText('NVIDIA Quadro RTX 6000').should('be.visible');
      cy.get('tbody tr')
        .should('have.length', 12)
        .each((_, index) => {
          // linode table has radio button in first column
          cy.get(`#${linodeLabels[index]}`).should('be.enabled');
        });
    });
  });
});

/*
 * Each test provided w/ array of 12 mock linode types. Type excluded if:
	- flag enabled and id includes 'blackwell'
	- enterprise tier and id includes 'gpu'
 * If visible in table, rows are always enabled
*/
xdescribe('smoketest for Nvidia blackwell GPUs in kubernetes/create page', () => {
  beforeEach(() => {
    cy.wrap(mockRegion).as('mockRegion');
    mockGetRegions([mockRegion]).as('getRegions');
    const mockRegionAvailability = linodeLabels.map((planName) =>
      regionAvailabilityFactory.build({
        plan: planName,
        available: true,
        region: mockRegion.id,
      })
    );
    mockGetRegionAvailability(mockRegion.id, mockRegionAvailability).as(
      'getRegionAvailability'
    );

    // table on GPU tab populated by types w/ class = 'gpu'
    const mockLinodeTypes = linodeLabels.map((planName) =>
      linodeTypeFactory.build({
        id: `id-${randomLabel()}`,
        class: 'gpu',
        label: planName,
      })
    );
    const mockBlackwellLinodeTypes = linodeLabels.map((planName) =>
      linodeTypeFactory.build({
        id: `id-blackwell-${randomLabel()}`,
        class: 'gpu',
        label: 'blackwell-' + planName,
      })
    );
    const mockEnterpriseLinodeTypes = linodeLabels.map((planName) =>
      linodeTypeFactory.build({
        id: `id-gpu-${randomLabel()}`,
        class: 'gpu',
        label: 'gpu-' + planName,
      })
    );
    mockGetLinodeTypes([
      ...mockLinodeTypes,
      ...mockBlackwellLinodeTypes,
      ...mockEnterpriseLinodeTypes,
    ]).as('getLinodeTypes');
  });

  describe('standard tier', () => {
    it('enabled feature flag includes blackwells', function () {
      mockAppendFeatureFlags({
        kubernetesBlackwellPlans: true,
      }).as('getFeatureFlags');
      cy.visitWithLogin('/kubernetes/create');
      cy.wait(['@getFeatureFlags', '@getRegions', '@getLinodeTypes']);

      ui.regionSelect.find().click();
      ui.regionSelect.find().clear();
      ui.regionSelect.find().type(`${this.mockRegion.label}{enter}`);
      cy.wait('@getRegionAvailability');
      // Navigate to "GPU" tab
      ui.tabList.findTabByTitle('GPU').scrollIntoView();
      ui.tabList.findTabByTitle('GPU').should('be.visible').click();

      cy.findByRole('table', {
        name: 'List of NVIDIA Quadro RTX 6000 Plans',
      }).within(() => {
        cy.findByText('NVIDIA Quadro RTX 6000').should('be.visible');
        cy.get('tbody tr')
          .should('have.length', 12)
          .each((row) => {
            cy.wrap(row).within(() => {
              ui.button
                .findByTitle('Configure Pool')
                .should('be.visible')
                .should('be.enabled');
            });
          });
      });
    });

    it('disabled feature flag excludes blackwells', function () {
      mockAppendFeatureFlags({
        kubernetesBlackwellPlans: false,
      }).as('getFeatureFlags');
      // const linodePayload = createLinodeRequestFactory.build({
      //   booted: false,
      //   label: randomLabel(),
      //   region: mockRegion.id,
      //   type: 'g6-nanode-1',
      // });

      cy.visitWithLogin('/kubernetes/create');
      cy.wait(['@getFeatureFlags', '@getRegions', '@getLinodeTypes']);

      ui.regionSelect.find().click();
      ui.regionSelect.find().clear();
      ui.regionSelect.find().type(`${this.mockRegion.label}{enter}`);
      cy.wait('@getRegionAvailability');
      // Navigate to "GPU" tab
      ui.tabList.findTabByTitle('GPU').scrollIntoView();
      ui.tabList.findTabByTitle('GPU').should('be.visible').click();

      cy.findByRole('table', {
        name: 'List of NVIDIA Quadro RTX 6000 Plans',
      }).within(() => {
        cy.findByText('NVIDIA Quadro RTX 6000').should('be.visible');
        cy.get('tbody tr')
          .should('have.length', 8)
          .each((row) => {
            cy.wrap(row).within(() => {
              ui.button
                .findByTitle('Configure Pool')
                .should('be.visible')
                .should('be.enabled');
            });
          });
      });
    });
  });

  describe('enterprise tier. excludes types w/ "gpu" in id', () => {
    it('enabled feature flag includes blackwells', function () {
      mockAppendFeatureFlags({
        kubernetesBlackwellPlans: true,
      }).as('getFeatureFlags');
      // const linodePayload = createLinodeRequestFactory.build({
      //   booted: false,
      //   label: randomLabel(),
      //   region: mockRegion.id,
      //   type: 'g6-nanode-1',
      // });

      cy.visitWithLogin('/kubernetes/create');
      cy.wait(['@getFeatureFlags', '@getRegions', '@getLinodeTypes']);

      cy.findByText('LKE Enterprise').click();
      ui.regionSelect.find().click();
      ui.regionSelect.find().clear();
      ui.regionSelect.find().type(`${this.mockRegion.label}{enter}`);
      // cy.wait('@getRegionAvailability');
      // Navigate to "GPU" tab
      ui.tabList.findTabByTitle('GPU').scrollIntoView();
      ui.tabList.findTabByTitle('GPU').should('be.visible').click();

      cy.findByRole('table', {
        name: 'List of NVIDIA Quadro RTX 6000 Plans',
      }).within(() => {
        cy.findByText('NVIDIA Quadro RTX 6000').should('be.visible');
        cy.get('tbody tr').should('have.length', 8);
      });
    });

    it('disabled feature flag excludes blackwells', function () {
      mockAppendFeatureFlags({
        kubernetesBlackwellPlans: false,
      }).as('getFeatureFlags');

      cy.visitWithLogin('/kubernetes/create');
      cy.wait(['@getFeatureFlags', '@getRegions', '@getLinodeTypes']);

      cy.findByText('LKE Enterprise').click();
      ui.regionSelect.find().click();
      ui.regionSelect.find().clear();
      ui.regionSelect.find().type(`${this.mockRegion.label}{enter}`);
      // Navigate to "GPU" tab
      ui.tabList.findTabByTitle('GPU').scrollIntoView();
      ui.tabList.findTabByTitle('GPU').should('be.visible').click();

      cy.findByRole('table', {
        name: 'List of NVIDIA Quadro RTX 6000 Plans',
      }).within(() => {
        cy.findByText('NVIDIA Quadro RTX 6000').should('be.visible');
        cy.get('tbody tr')
          .should('have.length', 4)
          .each((row) => {
            cy.wrap(row).within(() => {
              ui.button
                .findByTitle('Configure Pool')
                .should('be.visible')
                .should('be.enabled');
            });
          });
      });
    });
  });
});
