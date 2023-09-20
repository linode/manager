/**
 * @file Integration tests for Akamai Global Load Balancer details page.
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

/**
 * Uploads a Load Balancer certificate using the "Upload Certificate" drawer.
 *
 * This function assumes the "Upload Certificate" drawer is already open.
 *
 * @param type - Certificate type; either 'tls' or 'service-target'.
 * @param label - Certificate label.
 */
const uploadCertificate = (type: 'tls' | 'service-target', label: string) => {
  const radioSelector =
    type === 'tls' ? '[data-qa-cert-tls]' : '[data-qa-cert-service-target]';

  ui.drawer
    .findByTitle('Upload Certificate')
    .should('be.visible')
    .within(() => {
      cy.get(radioSelector).should('be.visible').click();

      cy.findByLabelText('Label').should('be.visible').type(label);

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
};

describe('Akamai Global Load Balancer details page', () => {
  /*
   * - Confirms Load Balancer certificate upload UI flow using mocked API requests.
   * - Confirms that TLS and Service Target certificates can be uploaded.
   * - Confirms that certificates table update to reflects uploaded certificates.
   */
  it('can upload a Load Balancer Certificate', () => {
    const mockLoadBalancer = loadbalancerFactory.build();
    const mockLoadBalancerCertTls = certificateFactory.build({
      label: randomLabel(),
      type: 'downstream',
    });
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
    uploadCertificate('tls', mockLoadBalancerCertTls.label);

    // Confirm that new certificate is listed in the table with expected info.
    cy.wait(['@uploadCertificate', '@getCertificates']);
    cy.findByText(mockLoadBalancerCertTls.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('TLS Certificate').should('be.visible');
      });

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
      mockLoadBalancerCertTls,
      mockLoadBalancerCertServiceTarget,
    ]).as('getCertificates');
    uploadCertificate(
      'service-target',
      mockLoadBalancerCertServiceTarget.label
    );

    // Confirm that both new certificates are listed in the table with expected info.
    cy.wait(['@uploadCertificate', '@getCertificates']);
    cy.findByText(mockLoadBalancerCertTls.label).should('be.visible');
    cy.findByText(mockLoadBalancerCertServiceTarget.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Service Target Certificate').should('be.visible');
      });
  });
});
