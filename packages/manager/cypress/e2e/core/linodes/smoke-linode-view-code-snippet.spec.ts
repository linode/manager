/**
 * @file Linode Create end-to-end tests.
 */

import { ui } from 'support/ui';

import { randomLabel, randomString } from 'support/util/random';
import { linodeCreatePage } from 'support/ui/pages';
import { authenticate } from 'support/api/authentication';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';

import {
  regionFactory,
  imageFactory,
  profileFactory,
  userPreferencesFactory,
  accountFactory,
  firewallFactory,
  accountUserFactory,
  vpcFactory,
  linodeTypeFactory,
  regionAvailabilityFactory,
} from 'src/factories';

import { mockGetLinodeTypes } from 'support/intercepts/linodes';
import { mockGetAllImages } from 'support/intercepts/images';
import {
  mockGetProfile,
  mockGetUserPreferences,
} from 'support/intercepts/profile';
import { accountSettingsFactory } from '@src/factories/accountSettings';
import {
  mockGetAccount,
  mockGetAccountSettings,
  mockGetUsers,
} from 'support/intercepts/account';
import type { Region } from '@linode/api-v4';
import {
  mockGetRegions,
  mockGetRegionAvailability,
} from 'support/intercepts/regions';
import { mockGetFirewalls } from 'support/intercepts/firewalls';
import { mockGetVPCs } from 'support/intercepts/vpc';

authenticate();

const mockProfile = profileFactory.build({
  username: 'mock-user',
  restricted: false,
});
const mockAccount = accountFactory.build();
const mockAccountSettings = accountSettingsFactory.build();
const mockPreferencesListView = userPreferencesFactory.build();
const mockRegions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes', 'Placement Group'],
    id: 'us-east',
    label: 'Newark, NJ',
    country: 'us',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-central',
    label: 'Dallas, TX',
    country: 'us',
  }),
];
const mockImages = [imageFactory.build()];
const mockFirewall = [firewallFactory.build()];
const mockUsers = [accountUserFactory.build()];
const mockVPCs = [vpcFactory.build()];
const mockLinodeTypes = [
  linodeTypeFactory.build({
    id: 'nanode-1',
    label: 'Nanode 1 GB',
    class: 'nanode',
  }),
  linodeTypeFactory.build({
    id: 'dedicated-1',
    label: 'dedicated-1',
    class: 'dedicated',
  }),
];
const mockRegionAvailability = [
  regionAvailabilityFactory.build({
    plan: 'dedicated-3',
    available: false,
    region: 'us-east',
  }),
  regionAvailabilityFactory.build({
    plan: 'dedicated-4',
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

describe('Create Linode', () => {
  /*
   * End-to-end tests for create Linode flow and validate code snippet modal.
   */
  describe('Create Linode flow with apicliDxToolsAdditions enabled', () => {
    // Enable the `apicliDxToolsAdditions` feature flag.
    // TODO Delete these mocks once `apicliDxToolsAdditions` feature flag is retired.
    beforeEach(() => {
      mockAppendFeatureFlags({
        apicliDxToolsAdditions: makeFeatureFlagData(true),
        linodeCreateRefactor: makeFeatureFlagData(true),
      });
      mockGetFeatureFlagClientstream();
    });
    it(`view code snippets in create linode flow`, () => {
      const linodeLabel = randomLabel();
      const rootPass = randomString(32);

      mockGetProfile(mockProfile).as('getProfile');
      mockGetAccount(mockAccount).as('getAccount');
      mockGetAccountSettings(mockAccountSettings).as('getAccountSettings');
      mockGetUserPreferences(mockPreferencesListView).as('getUserPreferences');
      mockGetRegions(mockRegions).as('getRegions');
      mockGetAllImages(mockImages).as('getImages');
      mockGetFirewalls(mockFirewall).as('getFirewalls');
      mockGetUsers(mockUsers).as('getUsers');
      mockGetVPCs(mockVPCs).as('getVPCs');
      mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
      mockGetRegionAvailability(mockRegions[0].id, mockRegionAvailability).as(
        'getRegionAvailability'
      );

      cy.visitWithLogin('/linodes/create');

      cy.wait([
        '@getProfile',
        '@getAccount',
        '@getAccountSettings',
        '@getUserPreferences',
        '@getRegions',
        '@getImages',
        '@getFirewalls',
        '@getUsers',
        '@getVPCs',
        '@getLinodeTypes',
      ]);

      // Set Linode label, distribution, plan type, password, etc.
      linodeCreatePage.setLabel(linodeLabel);
      linodeCreatePage.selectImage('image-1');
      linodeCreatePage.selectRegionById('us-east');
      cy.wait(['@getRegionAvailability']);
      linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
      linodeCreatePage.setRootPassword(rootPass);

      // View Code Snippets and confirm it's provisioned as expected.
      ui.button
        .findByTitle('View Code Snippets')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.dialog
        .findByTitle('Create Linode')
        .should('be.visible')
        .within(() => {
          ui.tabList
            .findTabByTitle('cURL')
            .should('be.visible')
            .should('be.enabled');

          ui.tabList.findTabByTitle('Linode CLI').should('be.visible').click();

          // Validate Integrations
          ui.tabList
            .findTabByTitle('Integrations')
            .should('be.visible')
            .click();

          // Validate Ansible and links
          ui.autocomplete.find().click();

          ui.autocompletePopper
            .findByTitle('Ansible')
            .should('be.visible')
            .click();
          cy.contains(
            'a',
            'Getting Started With Ansible: Basic Installation and Setup'
          ).should('be.visible');
          cy.contains('a', 'Linode Cloud Instance Module').should('be.visible');
          cy.contains('a', 'Manage Personal Access Tokens').should(
            'be.visible'
          );
          cy.contains('a', 'Best Practices For Ansible').should('be.visible');
          cy.contains(
            'a',
            'Use the Linode Ansible Collection to Deploy a Linode'
          ).should('be.visible');

          // Validate Terraform and links
          ui.autocomplete.find().click();
          ui.autocompletePopper
            .findByTitle('Terraform')
            .should('be.visible')
            .click();
          cy.contains('a', `A Beginner's Guide to Terraform`).should(
            'be.visible'
          );
          cy.contains('a', 'Install Terraform').should('be.visible');
          cy.contains('a', 'Manage Personal Access Tokens').should(
            'be.visible'
          );
          cy.contains('a', 'Use Terraform With Linode Object Storage').should(
            'be.visible'
          );
          cy.contains(
            'a',
            'Use Terraform to Provision Infrastructure on Linode'
          ).should('be.visible');
          cy.contains(
            'a',
            'Import Existing Infrastructure to Terraform'
          ).should('be.visible');

          // Validate SDK's tab
          ui.tabList.findTabByTitle(`SDK's`).should('be.visible').click();

          ui.autocomplete.find().click();

          // Validate linodego and links
          ui.autocompletePopper
            .findByTitle('Go (linodego)')
            .should('be.visible')
            .click();
          cy.contains('a', 'Go client for Linode REST v4 API').should(
            'be.visible'
          );
          cy.contains('a', 'Linodego Documentation').should('be.visible');

          ui.autocomplete.find().click();

          // Validate Python API4 and links
          ui.autocompletePopper
            .findByTitle('Python (linode_api4-python)')
            .should('be.visible')
            .click();

          cy.contains(
            'a',
            'Official python library for the Linode APIv4 in python'
          ).should('be.visible');
          cy.contains('a', 'linode_api4-python Documentation').should(
            'be.visible'
          );

          ui.button
            .findByTitle('Close')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });
    });
  });
  describe('Create Linode flow with apicliDxToolsAdditions enabled', () => {
    // Enable the `apicliDxToolsAdditions` feature flag.
    // TODO Delete these mocks and test once `apicliDxToolsAdditions` feature flag is retired.
    beforeEach(() => {
      mockAppendFeatureFlags({
        apicliDxToolsAdditions: makeFeatureFlagData(false),
        linodeCreateRefactor: makeFeatureFlagData(true),
      });
      mockGetFeatureFlagClientstream();
    });
    it(`view code snippets in create linode flow`, () => {
      const linodeLabel = randomLabel();
      const rootPass = randomString(32);

      mockGetProfile(mockProfile).as('getProfile');
      mockGetAccount(mockAccount).as('getAccount');
      mockGetAccountSettings(mockAccountSettings).as('getAccountSettings');
      mockGetUserPreferences(mockPreferencesListView).as('getUserPreferences');
      mockGetRegions(mockRegions).as('getRegions');
      mockGetAllImages(mockImages).as('getImages');
      mockGetFirewalls(mockFirewall).as('getFirewalls');
      mockGetUsers(mockUsers).as('getUsers');
      mockGetVPCs(mockVPCs).as('getVPCs');
      mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
      mockGetRegionAvailability(mockRegions[0].id, mockRegionAvailability).as(
        'getRegionAvailability'
      );

      cy.visitWithLogin('/linodes/create');

      cy.wait([
        '@getProfile',
        '@getAccount',
        '@getAccountSettings',
        '@getUserPreferences',
        '@getRegions',
        '@getImages',
        '@getFirewalls',
        '@getUsers',
        '@getVPCs',
        '@getLinodeTypes',
      ]);

      // Set Linode label, distribution, plan type, password, etc.
      linodeCreatePage.setLabel(linodeLabel);
      linodeCreatePage.selectImage('image-1');
      linodeCreatePage.selectRegionById('us-east');
      cy.wait(['@getRegionAvailability']);
      linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
      linodeCreatePage.setRootPassword(rootPass);

      // View Code Snippets and confirm it's provisioned as expected.
      ui.button
        .findByTitle('Create using command line')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.dialog
        .findByTitle('Create Linode')
        .should('be.visible')
        .within(() => {
          ui.tabList
            .findTabByTitle('cURL')
            .should('be.visible')
            .should('be.enabled');

          ui.tabList.findTabByTitle('Linode CLI').should('be.visible').click();

          // Validate Integrations
          ui.tabList.findTabByTitle('Integrations').should('not.exist');
          // Validate Integrations
          ui.tabList.findTabByTitle(`SDK's`).should('not.exist');

          ui.button
            .findByTitle('Close')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });
    });
  });
});
