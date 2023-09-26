/**
 * @file Integration tests for Akamai Global Load Balancer certificates page.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { loadbalancerFactory, certificateFactory } from '@src/factories';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';
import {
  mockGetLoadBalancer,
  mockGetLoadBalancerCertificates,
  mockUploadLoadBalancerCertificate,
} from 'support/intercepts/load-balancers';

describe('Akamai Global Load Balancer certificates page', () => {
  /*
   * - Confirms Load Balancer certificate upload UI flow using mocked API requests.
   * - Confirms that TLS and Service Target certificates can be uploaded.
   * - Confirms that certificates table update to reflects uploaded certificates.
   */
  it('can upload a TLS certificate', () => {
    const mockLoadBalancer = loadbalancerFactory.build();
    const mockLoadBalancerCertTls = certificateFactory.build({
      label: randomLabel(),
      type: 'downstream',
    });

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(mockLoadBalancer).as('getLoadBalancer');
    mockGetLoadBalancerCertificates(mockLoadBalancer.id, []).as(
      'getCertificates'
    );

    cy.visitWithLogin(`/loadbalancers/${mockLoadBalancer.id}/certificates`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getCertificates',
    ]);

    // Confirm that no certificates are listed.
    cy.findByText('No items to display.').should('be.visible');

    // Upload a TLS certificate.
    ui.button
      .findByTitle('Upload Certificate')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockUploadLoadBalancerCertificate(
      mockLoadBalancer.id,
      mockLoadBalancerCertTls
    ).as('uploadCertificate');

    mockGetLoadBalancerCertificates(mockLoadBalancer.id, [
      mockLoadBalancerCertTls,
    ]).as('getCertificates');

    ui.drawer
      .findByTitle('Upload TLS Certificate')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label')
          .should('be.visible')
          .type(mockLoadBalancerCertTls.label);

        cy.findByLabelText('TLS Certificate')
          .should('be.visible')
          .type(randomString(32));

        cy.findByLabelText('Private Key')
          .should('be.visible')
          .type(randomString(32));

        ui.buttonGroup
          .findButtonByTitle('Upload Certificate')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@uploadCertificate', '@getCertificates']);

    // Confirm that new certificate is listed in the table with expected info.
    cy.findByText(mockLoadBalancerCertTls.label).should('be.visible');
  });
  it('can upload a service target certificate', () => {
    const mockLoadBalancer = loadbalancerFactory.build();
    const mockLoadBalancerCertServiceTarget = certificateFactory.build({
      label: randomLabel(),
      type: 'ca',
    });

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(mockLoadBalancer).as('getLoadBalancer');
    mockGetLoadBalancerCertificates(mockLoadBalancer.id, []).as(
      'getCertificates'
    );

    cy.visitWithLogin(`/loadbalancers/${mockLoadBalancer.id}/certificates/ca`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getCertificates',
    ]);

    // Confirm that no certificates are listed.
    cy.findByText('No items to display.').should('be.visible');

    // Upload a TLS certificate.
    ui.button
      .findByTitle('Upload Certificate')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Upload a service target certificate.
    mockUploadLoadBalancerCertificate(
      mockLoadBalancer.id,
      mockLoadBalancerCertServiceTarget
    ).as('uploadCertificate');
    mockGetLoadBalancerCertificates(mockLoadBalancer.id, [
      mockLoadBalancerCertServiceTarget,
    ]).as('getCertificates');

    ui.drawer
      .findByTitle('Upload Service Target Certificate')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label')
          .should('be.visible')
          .type(mockLoadBalancerCertServiceTarget.label);

        cy.findByLabelText('TLS Certificate')
          .should('be.visible')
          .type(randomString(32));

        ui.buttonGroup
          .findButtonByTitle('Upload Certificate')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@uploadCertificate', '@getCertificates']);

    // Confirm that both new certificates are listed in the table with expected info.
    cy.findByText(mockLoadBalancerCertServiceTarget.label).should('be.visible');
  });
});
