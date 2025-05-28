import { regionFactory } from '@linode/utilities';
import { profileFactory } from '@linode/utilities';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockApiInternalUser } from 'support/intercepts/general';
import {
  mockGetObjectStorageEndpoints,
  mockGetObjectStorageQuotaError,
  mockGetObjectStorageQuotas,
  mockGetObjectStorageQuotaUsages,
} from 'support/intercepts/object-storage';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockCreateSupportTicket } from 'support/intercepts/support';
import { ui } from 'support/ui';
import { randomDomainName, randomLabel } from 'support/util/random';

import { supportTicketFactory } from 'src/factories';
import { objectStorageEndpointsFactory } from 'src/factories';
import { quotaFactory, quotaUsageFactory } from 'src/factories/quotas';
import { getQuotaIncreaseMessage } from 'src/features/Account/Quotas/utils';

const mockRegions = regionFactory.buildList(4, {
  capabilities: ['Object Storage'],
});

const mockDomain = randomDomainName();
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

describe('Quotas accessible when limitsEvolution feature flag enabled', () => {
  beforeEach(() => {
    // TODO M3-10003 - Remove mock once `limitsEvolution` feature flag is removed.
    mockAppendFeatureFlags({
      limitsEvolution: {
        enabled: true,
        requestForIncreaseDisabledForInternalAccountsOnly: false,
        // requestForIncreaseDisabledForAll: false
      },
    }).as('getFeatureFlags');
  });
  xit('can navigate directly to Quotas page', () => {
    cy.visitWithLogin('/account/quotas');
    cy.wait('@getFeatureFlags');
    cy.url().should('endWith', '/quotas');
    cy.contains(
      'View your Object Storage quotas by applying the endpoint filter below'
    ).should('be.visible');
  });

  xit('can navigate to the Quotas page via the User Menu', () => {
    cy.visitWithLogin('/');
    cy.wait('@getFeatureFlags');
    // Open user menu
    ui.userMenuButton.find().click();
    ui.userMenu.find().within(() => {
      cy.get('[data-testid="menu-item-Quotas"]').should('be.visible').click();
      cy.url().should('endWith', '/quotas');
    });
  });

  xit('Quotas tab is visible from all other tabs in Account tablist', () => {
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

  it('Endpoint workflow follows proper sequence', () => {
    const mockProfile = profileFactory.build({
      email: 'mock-user@linode.com',
      restricted: false,
    });
    mockGetProfile(mockProfile).as('getProfile');
    const mockSelectedEndpoint = mockEndpoints[1];
    const selectedDomain = mockSelectedEndpoint.s3_endpoint || '';
    const mockQuotas = [
      quotaFactory.build({
        quota_id: `obj-bytes-${selectedDomain}`,
        description: randomLabel(50),
        endpoint_type: mockSelectedEndpoint.endpoint_type,
        quota_limit: 10,
        quota_name: randomLabel(15),
        resource_metric: 'byte',
        s3_endpoint: selectedDomain,
      }),
      quotaFactory.build({
        quota_id: `obj-buckets-${selectedDomain}`,
        description: randomLabel(50),
        endpoint_type: mockSelectedEndpoint.endpoint_type,
        quota_limit: 78,
        quota_name: randomLabel(15),
        resource_metric: 'bucket',
        s3_endpoint: selectedDomain,
      }),
      quotaFactory.build({
        quota_id: `obj-objects-${selectedDomain}`,
        description: randomLabel(50),
        endpoint_type: mockSelectedEndpoint.endpoint_type,
        quota_limit: 400,
        quota_name: randomLabel(15),
        resource_metric: 'object',
        s3_endpoint: selectedDomain,
      }),
    ];
    const mockQuotaUsages = [
      quotaUsageFactory.build({
        quota_limit: mockQuotas[0].quota_limit,
        usage: Math.round(mockQuotas[0].quota_limit * 0.1),
      }),
      quotaUsageFactory.build({
        quota_limit: mockQuotas[1].quota_limit,
        usage: Math.round(mockQuotas[1].quota_limit * 0.1),
      }),
      quotaUsageFactory.build({
        quota_limit: mockQuotas[2].quota_limit,
        usage: Math.round(mockQuotas[2].quota_limit * 0.1),
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
    mockApiInternalUser();
    const ticketSummary = 'Increase Object Storage Quota';
    const expectedResults = [
      {
        newQuotaLimit: mockQuotas[0].quota_limit * 2,
        description: randomLabel(),
        metric: 'Bytes',
      },
      {
        newQuotaLimit: mockQuotas[1].quota_limit * 2,
        description: randomLabel(),
        metric: 'Buckets',
      },
      {
        newQuotaLimit: mockQuotas[2].quota_limit * 2,
        description: randomLabel(),
        metric: 'Objects',
      },
    ];
    mockQuotas.forEach((mockQuota, index) => {
      cy.visitWithLogin('/account/quotas');
      cy.wait(['@getFeatureFlags', '@getProfile']);
      // Quotas table placeholder text is shown
      cy.get('[data-testid="table-row-empty"]').should('be.visible');

      // Object Storage Endpoint field is blank
      const placeholderText = 'Select an Object Storage S3 endpoint';
      cy.findByPlaceholderText(placeholderText)
        .should('be.visible')
        .should('be.enabled');
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
          cy.get('tr').each(($row, rowIndex) => {
            cy.wrap($row).within(() => {
              cy.get('td')
                .eq(0)
                .within(() => {
                  // TODO: this is flakey, unreliable
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
                .within(() => {
                  // quota usage
                  const strUsage = `${mockQuotaUsages[rowIndex].usage} of ${mockQuotaUsages[rowIndex].quota_limit}`;
                  cy.findByText(strUsage, { exact: false }).should(
                    'be.visible'
                  );
                });
            });
          });
        });

      // Quotas increase request workflow
      ui.actionMenu
        .findByTitle(`Action menu for quota ${mockQuota.quota_name}`)
        .should('be.visible')
        .should('be.enabled')
        .click();
      ui.actionMenuItem
        .findByTitle('Request Increase')
        .should('be.visible')
        .click();
      ui.dialog
        .findByTitle(`Contact Support: ${ticketSummary}`)
        .should('be.visible')
        .within(() => {
          cy.get('input[name="quantity"]').should(
            'have.value',
            mockQuota.quota_limit
          );
          cy.findByLabelText('New Quota (required)')
            .should('be.visible')
            .should('be.enabled')
            .clear();
          cy.focused().type(expectedResults[index].newQuotaLimit.toString());
          cy.findByLabelText('Description (required)')
            .should('be.visible')
            .should('be.enabled')
            .type(expectedResults[index].description);
          const mockTicket = supportTicketFactory.build({
            summary: ticketSummary,
            description: getQuotaIncreaseMessage({
              convertedMetrics: {
                limit: mockQuota.quota_limit,
                metric: expectedResults[index].metric,
              },
              neededIn: 'Fewer than 7 days',
              profile: mockProfile,
              quantity: expectedResults[index].newQuotaLimit,
              quota: mockQuota,
              selectedService: {
                label: 'Object Storage',
                value: 'object-storage',
              },
            }).description,
          });
          mockCreateSupportTicket(mockTicket).as('createTicket');

          // TODO: preview
          ui.accordionHeading
            .findByTitle('Ticket Preview')
            .should('be.visible')
            .should('be.enabled')
            .click();
          ui.accordion.findByTitle('Ticket Preview').scrollIntoView();
          ui.accordion.findByTitle('Ticket Preview').within(() => {
            cy.get(
              '[data-testid="quota-increase-form-preview-content"]'
            ).within(() => {
              cy.contains(`Quota Name: ${mockQuota.quota_name}`);
              cy.contains(
                `Current Quota: ${mockQuota.quota_limit} ${expectedResults[index].metric}`
              );
              cy.contains(
                `New Quota Requested: ${expectedResults[index].newQuotaLimit} ${expectedResults[index].metric}`
              );
            });
          });

          ui.button.findByTitle('Submit').should('be.visible').scrollIntoView();
          ui.button.findByTitle('Submit').should('be.enabled').click();

          // TODO: cancel
          // ui.button.findByTitle('Cancel').scrollIntoView().should('be.visible').click();
          cy.wait('@createTicket').then((xhr) => {
            expect(xhr.request.body?.summary).to.eq(mockTicket.summary);
            expect(xhr.request.body?.description).startWith(
              mockTicket.description
            );
          });
          cy.url().should('endWith', `support/tickets/${mockTicket.id}`);
        });
    });
  });

  xit('API error results in error message being displayed', () => {
    const mockSelectedEndpoint = mockEndpoints[1];
    const selectedDomain = mockSelectedEndpoint.s3_endpoint || '';
    const errorMsg = 'Request failed.';
    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );
    mockGetObjectStorageQuotaError(errorMsg).as('getQuotasError');
    cy.visitWithLogin('/account/quotas');
    cy.wait('@getObjectStorageEndpoints');
    ui.autocomplete
      .findByLabel('Object Storage Endpoint')
      .should('be.visible')
      .type(selectedDomain);
    ui.autocompletePopper
      .findByTitle(selectedDomain, { exact: false })
      .should('be.visible')
      .click();
    cy.wait('@getQuotasError');
    cy.get('[data-qa-error-msg="true"]')
      .should('be.visible')
      .should('have.text', errorMsg);
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
