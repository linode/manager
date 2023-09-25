/**
 * @file Integration tests for VPC create flow.
 */

import type { Subnet, VPC } from '@linode/api-v4';
import { vpcFactory, subnetFactory } from '@src/factories';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import {
  randomLabel,
  randomPhrase,
  randomIp,
  randomNumber,
} from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { ui } from 'support/ui';

export const getSubnetNodeSection = (index: number) => {
  return cy.get(`[data-qa-subnet-node="${index}"]`);
};

describe('VPC create flow', () => {
  it('can create a VPC', () => {
    const vpcRegion = chooseRegion();

    const mockSubnets: Subnet[] = subnetFactory.buildList(5);
    const mockSubnetDelete: Subnet = subnetFactory.build();

    const mockInvalidIpRange = `${randomIp()}/${randomNumber(33, 100)}`;

    const mockVpc: VPC = vpcFactory.build({
      label: randomLabel(),
      region: vpcRegion.id,
      description: randomPhrase(),
      subnets: subnetFactory.buildList(5),
    });

    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientstream');

    cy.visitWithLogin('/vpcs/create');
    cy.wait(['@getFeatureFlags', '@getClientstream']);

    cy.findByText('Region')
      .should('be.visible')
      .click()
      .type(`${vpcRegion.label}{enter}`);

    cy.findByText('VPC label').should('be.visible').click().type(mockVpc.label);

    cy.findByText('Description')
      .should('be.visible')
      .click()
      .type(mockVpc.description);

    // Fill out the first Subnet.
    // Insert an invalid IP address range to confirm client side validation.
    getSubnetNodeSection(0)
      .should('be.visible')
      .within(() => {
        cy.findByText('Subnet label')
          .should('be.visible')
          .click()
          .type(mockSubnets[0].label);

        cy.findByText('Subnet IP Address Range')
          .should('be.visible')
          .click()
          .type(`{selectAll}{backspace}`)
          .type(mockInvalidIpRange);
      });

    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText('The IPv4 range must be in CIDR format').should('be.visible');

    // Replace invalid IP address range with valid range.
    cy.findByText('Subnet IP Address Range')
      .should('be.visible')
      .click()
      .type(`{selectAll}{backspace}`)
      .type(`${randomIp()}/${randomNumber(0, 32)}`);

    // Add another subnet that will later be removed.
    ui.button
      .findByTitle('Add a Subnet')
      .should('be.visible')
      .should('be.enabled')
      .click();

    getSubnetNodeSection(1)
      .should('be.visible')
      .within(() => {
        cy.findByText('Subnet label')
          .should('be.visible')
          .click()
          .type(mockSubnetDelete.label);

        cy.findByText('Subnet IP Address Range')
          .should('be.visible')
          .click()
          .type(`{selectAll}{backspace}`)
          .type(`${randomIp()}/${randomNumber(0, 32)}`);

        cy.findByLabelText('Remove Subnet')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that Subnet section has been removed from the page.
    getSubnetNodeSection(1).should('not.exist');
    cy.findByText(mockSubnetDelete.label).should('not.exist');

    // cy.get('[data-qa-subnet-node="1"]')
    //   .should('be.visible')
    //   .within(() => {
    //     cy.findByText('Subnet label')
    //     .should('be.visible')
    //     .click()
    //     .type(mockSubnetDelete.label)

    //   cy.findByText('Subnet IP Address Range')
    //     .should('be.visible')
    //     .click()
    //     .type(`{selectAll}{backspace}`)
    //     .type(`${randomIp()}/${randomNumber(0, 32)}`);
    //   });
  });
});
