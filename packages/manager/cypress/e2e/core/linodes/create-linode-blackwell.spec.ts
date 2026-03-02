import {
  linodeFactory,
  linodeTypeFactory,
  regionAvailabilityFactory,
  regionFactory,
} from '@linode/utilities';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
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
const mockBlackwellLinodeTypes = new Array(4).fill(null).map((_, index) =>
  linodeTypeFactory.build({
    id: `g3-gpu-rtxpro6000-blackwell-${index + 1}`,
    label: `RTX PRO 6000 Blackwell x${index + 1}`,
    class: 'gpu',
  })
);
const selectedBlackwell = mockBlackwellLinodeTypes[0];

describe('smoketest for Nvidia blackwell GPUs in linodes/create page', () => {
  beforeEach(() => {
    mockGetRegions([mockEnabledRegion, mockDisabledRegion]).as('getRegions');

    mockGetLinodeTypes(mockBlackwellLinodeTypes).as('getLinodeTypes');
  });

  /*
   * Blackwells not enabled if region not enables it
   */
  it('disables Blackwells if disabled region selected', function () {
    const mockRegionAvailability = mockBlackwellLinodeTypes.map((type) =>
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
      name: 'List of Linode Plans',
    }).within(() => {
      cy.get('tbody tr')
        .should('have.length', 4)
        .each((_, index) => {
          // linode table has radio button in first column
          cy.get(`#${mockBlackwellLinodeTypes[index].id}`).should(
            'be.disabled'
          );
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
      name: 'List of Linode Plans',
    }).within(() => {
      cy.get('tbody tr')
        .should('have.length', 4)
        .each((_, index) => {
          // linode table has radio button in first column
          cy.get(`#${mockBlackwellLinodeTypes[index].id}`).should('be.enabled');
        });

      // select blackwell plan
      cy.get(`input#${selectedBlackwell.id}`).click();
    });
    const newLinodeLabel = randomLabel();
    cy.findByLabelText('Linode Label').type(newLinodeLabel);
    cy.get('[type="password"]').should('be.visible').scrollIntoView();
    cy.get('[id="root-password"]').type(randomString(12));
    cy.scrollTo('bottom');
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: mockEnabledRegion.id,
      type: selectedBlackwell.id,
    });
    mockCreateLinode(mockLinode).as('createLinode');

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // validate payload content
    cy.wait('@createLinode').then((xhr) => {
      // validate request
      const payload = xhr.request.body;
      expect(payload.region).to.eq(mockEnabledRegion.id);
      expect(payload.type).to.eq(selectedBlackwell.id);

      // validate response
      expect(xhr.response?.body?.id).to.eq(mockLinode.id);
      assert.equal(xhr.response?.statusCode, 200);
      cy.url().should('endWith', `linodes/${mockLinode.id}/metrics`);
    });
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
    // verify blackwell attributes displayed on new linode details page
    cy.findByText('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
      'be.visible'
    );
    cy.get('h1[data-qa-header]', { timeout: LINODE_CREATE_TIMEOUT })
      .should('be.visible')
      .should('have.text', mockLinode.label);
    cy.findByText('Plan:')
      .should('be.visible')
      .parent('p')
      .within(() => {
        cy.findByText(selectedBlackwell.label, { exact: false });
      });
  });
});
