import {
  linodeFactory,
  linodeTypeFactory,
  regionAvailabilityFactory,
  regionFactory,
} from '@linode/utilities';
// import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateLinode,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';
import {
  mockGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';

const linodeLabels = [
  `${randomLabel()}-1`,
  `${randomLabel()}-2`,
  `${randomLabel()}-3`,
  `${randomLabel()}-4`,
];

const mockEnabledRegion = regionFactory.build({
  id: 'us-east',
  label: 'Newark, NJ',
  capabilities: ['GPU Linodes', 'Linodes'],
});

const mockDisabledRegion = regionFactory.build({
  id: 'us-ord',
  label: 'Chicago, IL',
  capabilities: ['Linodes'],
});
// table on GPU tab populated by types w/ class = 'gpu'
const mockNotBlackwellLinodeTypes = linodeLabels.map((planName) =>
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
const mockLinodeTypes = [
  ...mockNotBlackwellLinodeTypes,
  ...mockBlackwellLinodeTypes,
];
const selectedBlackwellId = mockBlackwellLinodeTypes[0].id;

describe('smoketest for Nvidia blackwell GPUs in linodes/create page', () => {
  beforeEach(() => {
    mockGetRegions([mockEnabledRegion, mockDisabledRegion]).as('getRegions');

    mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
  });

  /*
   * Blackwells not enabled if region not enables it
   */
  it('disables Blackwells if disabled region selected', function () {
    const mockRegionAvailability = mockLinodeTypes.map((type) =>
      regionAvailabilityFactory.build({
        plan: type.label,
        available: false,
        region: mockDisabledRegion.id,
      })
    );
    mockGetRegionAvailability(mockDisabledRegion.id, mockRegionAvailability).as(
      'getRegionAvailability'
    );
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions']);
    ui.regionSelect.find().click();
    ui.regionSelect.find().clear();
    ui.regionSelect.find().type(`${mockDisabledRegion.label}{enter}`);
    cy.wait(['@getRegionAvailability']);
    // Navigate to "GPU" tab
    cy.get('[data-qa-tp="Linode Plan"]')
      .should('be.visible')
      .within(() => {
        ui.tabList.findTabByTitle('GPU').scrollIntoView();
        ui.tabList.findTabByTitle('GPU').should('be.visible').click();
      });
    cy.get('[data-qa-error="true"]').should('be.visible');

    cy.findByRole('table', {
      name: 'List of NVIDIA Quadro RTX 6000 Plans',
    }).within(() => {
      cy.findByText('NVIDIA Quadro RTX 6000').should('be.visible');
      cy.get('tbody tr')
        .should('have.length', 8)
        .each((_, index) => {
          // linode table has radio button in first column
          cy.get(`#${mockLinodeTypes[index].id}`).should('be.disabled');
        });
    });
  });

  /*
   * Displays all GPUs w/out any filtered
   */
  it('enables Blackwells if enabled region selected', function () {
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions']);
    ui.regionSelect.find().click();
    ui.regionSelect.find().clear();
    ui.regionSelect.find().type(`${mockEnabledRegion.label}{enter}`);
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
        .should('have.length', 8)
        .each((_, index) => {
          // linode table has radio button in first column
          cy.get(`#${mockLinodeTypes[index].id}`).should('be.enabled');
        });

      // select blackwell plan
      cy.get(`input#${selectedBlackwellId}`).click();
    });

    cy.get('[type="password"]').should('be.visible').scrollIntoView();
    cy.get('[id="root-password"]').type(randomString(12));
    cy.scrollTo('bottom');
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: mockEnabledRegion.id,
      type: selectedBlackwellId,
    });
    mockCreateLinode(mockLinode).as('createLinode');

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    // validate payload content

    cy.wait('@createLinode').then((xhr) => {
      const payload = xhr.request.body;
      expect(payload.region).to.eq(mockEnabledRegion.id);
      expect(payload.type).to.eq(selectedBlackwellId);
      // 		image
      // :
      // "linode/ubuntu24.04"
      // interfaces
      // :
      // [{…}]
      // label
      // :
      // "ubuntu-us-east"
      // private_ip
      // :
      // false
      // region
      // :
      // "us-east"
      // root_pass
      // :
      // "6EtWa2vIVSzH"
      // type
      // :
      // "id-blackwell-cy-test-yqsapwdxvy"
      //   debugger;
      //   const alerts = intercept.request.body['alerts'];
      //   expect(alerts).to.eq(undefined);
    });

    // page redirects to /linodes/<id>/metrics of newly created linode
  });
});
