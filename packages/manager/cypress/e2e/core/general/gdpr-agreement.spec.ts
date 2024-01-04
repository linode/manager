import { ui } from 'support/ui';
import { regionFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetAccountAgreements } from 'support/intercepts/account';

import type { Region } from '@linode/api-v4';

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

authenticate();
describe('GDPR agreement', () => {
  it('displays the GDPR agreement based on region, if user has not agreed yet', () => {
    mockGetRegions(mockRegions).as('getRegions');
    mockGetAccountAgreements({
      privacy_policy: false,
      eu_model: false,
    }).as('getAgreements');

    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getAgreements', '@getRegions']);

    // Paris should have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('fr-par').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('be.visible');

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
    cy.wait(['@getAgreements', '@getRegions']);

    // Paris should not have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('fr-par').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');

    // London should not have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('eu-west').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');

    // Newark should not have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('us-east').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');
  });
});
