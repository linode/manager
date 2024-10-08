import { ui } from 'support/ui';
import { linodeFactory, regionFactory } from '@src/factories';
import { randomString, randomLabel } from 'support/util/random';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetAccountAgreements } from 'support/intercepts/account';
import type { Region } from '@linode/api-v4';
import { mockCreateLinode } from 'support/intercepts/linodes';

const mockRegions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'fr',
    id: 'fr-par',
    label: 'Paris, FR',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'sg',
    id: 'ap-south',
    label: 'Singapore, SG',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'us',
    id: 'us-east',
    label: 'Newark, NJ',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'us',
    id: 'us-central',
    label: 'Dallas, TX',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'gb',
    id: 'eu-west',
    label: 'London, UK',
  }),
];

describe('GDPR agreement', () => {
  it('displays the GDPR agreement based on region, if user has not agreed yet', () => {
    mockGetRegions(mockRegions).as('getRegions');
    mockGetAccountAgreements({
      privacy_policy: false,
      eu_model: false,
    }).as('getAgreements');

    cy.visitWithLogin('/linodes/create');
    cy.wait('@getRegions');

    // Paris should have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('fr-par').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('be.visible');

    cy.wait('@getAgreements');

    // London should have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('eu-west').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('be.visible');

    // Newark should not have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('us-east').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');
  });

  it('does not display the GDPR agreement based on any region, if user has already agreed', () => {
    mockGetRegions(mockRegions).as('getRegions');
    mockGetAccountAgreements({
      privacy_policy: false,
      eu_model: true,
    }).as('getAgreements');

    cy.visitWithLogin('/linodes/create');
    cy.wait('@getRegions');

    // Paris should not have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('fr-par').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');

    cy.wait('@getAgreements');

    // London should not have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('eu-west').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');

    // Newark should not have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('us-east').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');
  });

  it('needs the agreement checked to submit the form', () => {
    mockGetRegions(mockRegions).as('getRegions');
    mockGetAccountAgreements({
      privacy_policy: false,
      eu_model: false,
    }).as('getAgreements');
    const rootpass = randomString(32);
    const linodeLabel = randomLabel();

    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions']);

    // Paris should have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('fr-par').click();

    cy.wait('@getAgreements');

    cy.findByText('Shared CPU').click();

    cy.get('[id="g6-nanode-1"]').click();

    cy.findByLabelText('Linode Label').clear().type(linodeLabel);

    cy.findByLabelText('Root Password').type(rootpass);

    cy.get('[data-testid="eu-agreement-checkbox"]')
      .scrollIntoView()
      .should('be.visible');

    cy.findByText('Create Linode')
      .scrollIntoView()
      .should('be.enabled')
      .should('be.visible')
      .click();

    cy.findByText(
      'You must agree to the EU agreement to deploy to this region.'
    ).should('be.visible');

    // check the agreement
    cy.get('#gdpr-checkbox').click();

    cy.findByText(
      'You must agree to the EU agreement to deploy to this region.'
    ).should('not.exist');

    mockCreateLinode(linodeFactory.build()).as('createLinode');

    cy.findByText('Create Linode')
      .should('be.enabled')
      .should('be.visible')
      .click();

    cy.wait('@createLinode');
  });
});
