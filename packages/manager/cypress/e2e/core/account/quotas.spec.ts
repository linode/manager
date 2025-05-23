import { regionFactory } from '@linode/utilities';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetObjectStorageEndpoints,
  mockGetObjectStorageQuotas,
  mockGetObjectStorageQuotaUsages,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';
import { randomDomainName, randomLabel } from 'support/util/random';

import { objectStorageEndpointsFactory } from 'src/factories';
import { quotaFactory, quotaUsageFactory } from 'src/factories/quotas';
describe('Quotas accessible when limitsEvolution feature flag enabled', () => {
  beforeEach(() => {
    // TODO M3-10003 - Remove mock once `limitsEvolution` feature flag is removed.
    mockAppendFeatureFlags({
      limitsEvolution: {
        enabled: true,
      },
    }).as('getFeatureFlags');
  });
  it('can navigate directly to Quotas page', () => {
    cy.visitWithLogin('/account/quotas');
    cy.wait('@getFeatureFlags');
    cy.url().should('endWith', '/quotas');
    cy.contains(
      'View your Object Storage quotas by applying the endpoint filter below'
    ).should('be.visible');
  });

  it('can navigate to the Quotas page via the User Menu', () => {
    cy.visitWithLogin('/');
    cy.wait('@getFeatureFlags');
    // Open user menu
    ui.userMenuButton.find().click();
    ui.userMenu.find().within(() => {
      cy.get('[data-testid="menu-item-Quotas"]').should('be.visible').click();
      cy.url().should('endWith', '/quotas');
    });
  });

  it('Quotas tab is visible from all other tabs in Account tablist', () => {
    cy.visitWithLogin('/account/billing');
    cy.wait('@getFeatureFlags');
    ui.tabList.find().within(() => {
      cy.get('a').each(($link) => {
        cy.wrap($link).click();
        cy.get('[data-testid="Quotas"]').should('be.visible');
      });
    });
    cy.get('[data-testid="Quotas"]').should('be.visible').click();
    cy.url().should('endWith', '/quotas');
  });

  // TODO: still flakey in selecting OS EP, typing doesnt always result in selection
  // TODO: need to use multiple regions?
  it('Endpoint workflow follows proper sequence', () => {
    const mockDomain = randomDomainName();
    const mockRegions = regionFactory.buildList(4, {
      capabilities: ['Object Storage'],
    });
    const mockEndpoints = [
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E0',
        region: mockRegions[0].id,
        s3_endpoint: `${mockRegions[0].id}-1.${mockDomain}`,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E1',
        region: mockRegions[1].id,
        s3_endpoint: `${mockRegions[1].id}-1.${mockDomain}`,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E1',
        region: mockRegions[2].id,
        s3_endpoint: `${mockRegions[2].id}-1.${mockDomain}`,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E2',
        region: mockRegions[3].id,
        s3_endpoint: `${mockRegions[3].id}-1.${mockDomain}`,
      }),
    ];

    const mockSelectedEndpoint = mockEndpoints[1];
    const selectedDomain = mockSelectedEndpoint.s3_endpoint || '';
    const mockQuotas = [
      quotaFactory.build({
        // @ts-expect-error type in packages/api-v4/src/quotas/types.ts is number but usage in QuotasTable.tsx is string
        quota_id: `obj-bytes-${selectedDomain}`,
        description: randomLabel(50),
        endpoint_type: mockSelectedEndpoint.endpoint_type,
        quota_limit: 10,
        quota_name: randomLabel(15),
        resource_metric: 'byte',
        s3_endpoint: selectedDomain,
      }),
      quotaFactory.build({
        // @ts-expect-error type in packages/api-v4/src/quotas/types.ts is number but usage in QuotasTable.tsx is string
        quota_id: `obj-buckets-${selectedDomain}`,
        description: randomLabel(50),
        endpoint_type: mockSelectedEndpoint.endpoint_type,
        quota_limit: 78,
        quota_name: randomLabel(15),
        resource_metric: 'bucket',
        s3_endpoint: selectedDomain,
      }),
      quotaFactory.build({
        // @ts-expect-error type in packages/api-v4/src/quotas/types.ts is number but usage in QuotasTable.tsx is string
        quota_id: `obj-objects-${selectedDomain}`,
        description: randomLabel(50),
        endpoint_type: mockSelectedEndpoint.endpoint_type,
        quota_limit: 555,
        quota_name: randomLabel(15),
        resource_metric: 'object',
        s3_endpoint: selectedDomain,
      }),
    ];
    const mockQuotaUsages = [
      quotaUsageFactory.build({
        quota_limit: mockQuotas[0].quota_limit,
        usage:
          mockQuotas[0].quota_limit -
          Math.round(mockQuotas[0].quota_limit * 0.1),
      }),
      quotaUsageFactory.build({
        quota_limit: mockQuotas[1].quota_limit,
        usage:
          mockQuotas[1].quota_limit -
          Math.round(mockQuotas[0].quota_limit * 0.1),
      }),
      quotaUsageFactory.build({
        quota_limit: mockQuotas[2].quota_limit,
        usage:
          mockQuotas[2].quota_limit -
          Math.round(mockQuotas[0].quota_limit * 0.1),
      }),
    ];
    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );
    mockGetObjectStorageQuotas(selectedDomain, mockQuotas).as('getQuotas');
    mockGetObjectStorageQuotaUsages(
      selectedDomain,
      'bytes',
      mockQuotaUsages[0]
    );
    mockGetObjectStorageQuotaUsages(
      selectedDomain,
      'buckets',
      mockQuotaUsages[1]
    );
    mockGetObjectStorageQuotaUsages(
      selectedDomain,
      'objects',
      mockQuotaUsages[2]
    ).as('getQuotaUsages');
    cy.visitWithLogin('/account/quotas');
    cy.wait('@getFeatureFlags');
    // Quotas table placeholder text is shown
    cy.get('[data-testid="table-row-empty"]').should('be.visible');

    // Object Storage Endpoint field is blank
    const placeholderText = 'Select an Object Storage S3 endpoint';
    cy.findByPlaceholderText(placeholderText)
      .should('be.visible')
      .should('be.enabled');
    console.log('selectedDomain ', selectedDomain);
    ui.autocomplete
      .findByLabel('Object Storage Endpoint')
      .should('be.visible')
      .type(selectedDomain);
    ui.autocompletePopper
      .findByTitle(selectedDomain, { exact: false })
      .should('be.visible')
      .click();
    cy.wait(['@getObjectStorageEndpoints', '@getQuotas']);
    cy.get('table[data-testid="table-endpoint-quotas"]')
      .find('tbody')
      .within(() => {
        cy.get('tr').should('have.length', 3);
        cy.get('[data-testid="table-row-empty"]').should('not.exist');
        cy.get('tr').should('have.length', 3);
        cy.get('tr').each((row, rowIndex) => {
          cy.wrap(row).within(() => {
            cy.get('td')
              .eq(0)
              .within(() => {
                cy.findByText(mockQuotas[rowIndex].quota_name, {
                  exact: false,
                }).should('be.visible');
                cy.get(
                  `[aria-label="${mockQuotas[rowIndex].description}"]`
                ).should('be.visible');
              });
            cy.get('td')
              .eq(1)
              .within(() => {
                cy.findByText(mockQuotas[rowIndex].quota_limit, {
                  exact: false,
                }).should('be.visible');
                cy.findByText(mockQuotas[rowIndex].resource_metric, {
                  exact: false,
                }).should('be.visible');
              });
          });
        });
        cy.wait(['@getQuotaUsages']);
        cy.get('tr').each((row, rowIndex) => {
          cy.wrap(row).within(() => {
            cy.get('td')
              .eq(2)
              .within((td) => {
                // quota usage
                const strUsage = `${mockQuotaUsages[rowIndex].usage} of ${mockQuotaUsages[rowIndex].quota_limit}`;
                cy.findByText(strUsage, { exact: false }).should('be.visible');
              });
          });
        });
      });
  });
});

xdescribe('Quotas inaccessible when limitsEvolution feature flag disabled', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      limitsEvolution: {
        enabled: false,
      },
    }).as('getFeatureFlags');
  });
  it('Quotas page is inaccessible', () => {
    cy.visitWithLogin('/account/quotas');
    cy.wait('@getFeatureFlags');
    cy.url().should('endWith', '/billing');
  });

  it('cannot navigate to the Quotas tab via the Users & Grants link in the User Menu', () => {
    cy.visitWithLogin('/');
    cy.wait('@getFeatureFlags');
    // Open user menu
    ui.userMenuButton.find().click();
    ui.userMenu.find().within(() => {
      cy.get('[data-testid="menu-item-Quotas"]').should('not.exist');
      cy.get('[data-testid="menu-item-Users & Grants"]')
        .should('be.visible')
        .click();
    });
    cy.url().should('endWith', '/users');
    cy.get('[data-testid="Quotas"]').should('not.exist');
  });

  it('cannot navigate to the Quotas tab via the Billing link in the User Menu', () => {
    cy.visitWithLogin('/');
    cy.wait('@getFeatureFlags');
    ui.userMenuButton.find().click();
    ui.userMenu.find().within(() => {
      cy.get('[data-testid="menu-item-Quotas"]').should('not.exist');
      cy.get('[data-testid="menu-item-Billing & Contact Information"]')
        .should('be.visible')
        .click();
    });
    cy.url().should('endWith', '/billing');
    cy.get('[data-testid="Quotas"]').should('not.exist');
  });
});
