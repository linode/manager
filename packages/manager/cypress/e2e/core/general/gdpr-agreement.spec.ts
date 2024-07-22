import { ui } from 'support/ui';
import { fbtClick, getClick } from 'support/helpers';
import { regionFactory } from '@src/factories';
import { randomString, randomLabel } from 'support/util/random';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetAccountAgreements } from 'support/intercepts/account';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';

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

  it('needs the agreement checked to validate the form', () => {
    // This test does not apply to Linode Create v2 because
    // Linode Create v2 allows you to press "Create Linode"
    // without checking the GDPR checkbox. (The user will
    // get a validation error if they have not agreed).
    mockAppendFeatureFlags({
      linodeCreateRefactor: makeFeatureFlagData(false),
    });
    mockGetFeatureFlagClientstream();
    mockGetRegions(mockRegions).as('getRegions');
    mockGetAccountAgreements({
      privacy_policy: false,
      eu_model: false,
    }).as('getAgreements');
    const rootpass = randomString(32);
    const linodeLabel = randomLabel();

    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getAgreements', '@getRegions']);

    // Paris should have the agreement
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId('fr-par').click();
    cy.get('[data-testid="eu-agreement-checkbox"]').should('be.visible');

    // Fill out the form
    fbtClick('Shared CPU');
    getClick('[id="g6-nanode-1"]');
    getClick('#linode-label').clear().type(linodeLabel);
    cy.get('#root-password').type(rootpass);

    // expect the button to be disabled
    cy.get('[data-qa-deploy-linode="true"]').should('be.disabled');

    // check the agreement
    getClick('#gdpr-checkbox');

    // expect the button to be enabled
    cy.get('[data-qa-deploy-linode="true"]').should('not.be.disabled');
  });
});
