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
import {
  mockCreateSupportTicket,
  mockCreateSupportTicketError,
  mockGetSupportTicketReplies,
} from 'support/intercepts/support';
import { ui } from 'support/ui';
import { randomDomainName, randomLabel } from 'support/util/random';

import { supportTicketFactory } from 'src/factories';
import { objectStorageEndpointsFactory } from 'src/factories';
import { quotaFactory, quotaUsageFactory } from 'src/factories/quotas';
import { getQuotaIncreaseMessage } from 'src/features/Account/Quotas/utils';

import type { Quota } from '@linode/api-v4';

const placeholderText = 'Select an Object Storage S3 endpoint';
describe('Quota workflow tests', () => {
  beforeEach(() => {
    // object storage mocks
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
    cy.wrap(selectedDomain).as('selectedDomain');
    cy.wrap(mockEndpoints).as('mockEndpoints');
    cy.wrap(mockQuotas).as('mockQuotas');
    cy.wrap(mockQuotaUsages).as('mockQuotaUsages');
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
    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );
    mockGetObjectStorageQuotas(selectedDomain, mockQuotas).as('getQuotas');
  });

  describe('Quota storage table', () => {
    beforeEach(() => {
      // TODO M3-10003 - Remove all limitsEvolution references once `limitsEvolution` feature flag is removed.
      mockAppendFeatureFlags({
        limitsEvolution: {
          enabled: true,
        },
      }).as('getFeatureFlags');
    });
    it('Quotas and quota usages display properly', function () {
      cy.visitWithLogin('/account/quotas');
      cy.wait(['@getFeatureFlags', '@getObjectStorageEndpoints']);
      // Quotas table placeholder text is shown
      cy.get('[data-testid="table-row-empty"]').should('be.visible');

      // Object Storage Endpoint field is blank
      cy.findByPlaceholderText(placeholderText)
        .should('be.visible')
        .should('be.enabled');
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .type(this.selectedDomain);
      ui.autocompletePopper
        .findByTitle(this.selectedDomain, { exact: false })
        .should('be.visible')
        .click();
      cy.wait(['@getQuotas', '@getQuotaUsages']);
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
                  cy.findByText(this.mockQuotas[rowIndex].quota_name, {
                    exact: false,
                  }).should('be.visible');
                  cy.get(
                    `[aria-label="${this.mockQuotas[rowIndex].description}"]`
                  ).should('be.visible');
                });
              cy.get('td')
                .eq(1)
                .within(() => {
                  cy.findByText(this.mockQuotas[rowIndex].quota_limit, {
                    exact: false,
                  }).should('be.visible');
                  cy.findByText(this.mockQuotas[rowIndex].resource_metric, {
                    exact: false,
                  }).should('be.visible');
                });
              cy.get('td')
                .eq(2)
                .within(() => {
                  // quota usage
                  const strUsage = `${this.mockQuotaUsages[rowIndex].usage} of ${this.mockQuotaUsages[rowIndex].quota_limit}`;
                  cy.findByText(strUsage, { exact: false }).should(
                    'be.visible'
                  );
                });
            });
          });
        });

      // selecting new object storage endpoint triggers update of quotas and quota usages
      const updatedEndpoint = this.mockEndpoints[this.mockEndpoints.length - 1];
      const updatedDomain = updatedEndpoint.s3_endpoint || '';
      const updatedQuotas = [
        quotaFactory.build({
          quota_id: `obj-bytes-${updatedDomain}`,
          description: randomLabel(50),
          endpoint_type: updatedEndpoint.endpoint_type,
          quota_limit: 20,
          quota_name: randomLabel(15),
          resource_metric: 'byte',
          s3_endpoint: updatedDomain,
        }),
        quotaFactory.build({
          quota_id: `obj-buckets-${updatedDomain}`,
          description: randomLabel(50),
          endpoint_type: updatedEndpoint.endpoint_type,
          quota_limit: 122,
          quota_name: randomLabel(15),
          resource_metric: 'bucket',
          s3_endpoint: updatedDomain,
        }),
        quotaFactory.build({
          quota_id: `obj-objects-${updatedDomain}`,
          description: randomLabel(50),
          endpoint_type: updatedEndpoint.endpoint_type,
          quota_limit: 450,
          quota_name: randomLabel(15),
          resource_metric: 'object',
          s3_endpoint: updatedDomain,
        }),
      ];
      const updatedQuotaUsages = [
        quotaUsageFactory.build({
          quota_limit: updatedQuotas[0].quota_limit,
          usage: Math.round(updatedQuotas[0].quota_limit * 0.1),
        }),
        quotaUsageFactory.build({
          quota_limit: updatedQuotas[1].quota_limit,
          usage: Math.round(updatedQuotas[1].quota_limit * 0.1),
        }),
        quotaUsageFactory.build({
          quota_limit: updatedQuotas[2].quota_limit,
          usage: Math.round(updatedQuotas[2].quota_limit * 0.1),
        }),
      ];
      mockGetObjectStorageQuotaUsages(
        updatedDomain,
        'bytes',
        updatedQuotaUsages[0]
      );
      mockGetObjectStorageQuotaUsages(
        updatedDomain,
        'buckets',
        updatedQuotaUsages[1]
      );
      mockGetObjectStorageQuotaUsages(
        updatedDomain,
        'objects',
        updatedQuotaUsages[2]
      ).as('getUpdatedQuotaUsages');
      mockGetObjectStorageQuotas(updatedDomain, updatedQuotas).as(
        'getUpdatedQuotas'
      );

      // select new endpoint in dropdown
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .clear();
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .type(updatedDomain);
      ui.autocompletePopper
        .findByTitle(updatedDomain, { exact: false })
        .should('be.visible')
        .click();
      cy.wait(['@getUpdatedQuotas', '@getUpdatedQuotaUsages']);
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
                  cy.findByText(updatedQuotas[rowIndex].quota_name, {
                    exact: false,
                  }).should('be.visible');
                  cy.get(
                    `[aria-label="${updatedQuotas[rowIndex].description}"]`
                  ).should('be.visible');
                });
              cy.get('td')
                .eq(1)
                .within(() => {
                  cy.findByText(updatedQuotas[rowIndex].quota_limit, {
                    exact: false,
                  }).should('be.visible');
                  cy.findByText(updatedQuotas[rowIndex].resource_metric, {
                    exact: false,
                  }).should('be.visible');
                });
              cy.get('td')
                .eq(2)
                .within(() => {
                  // quota usage
                  const strUsage = `${updatedQuotaUsages[rowIndex].usage} of ${updatedQuotaUsages[rowIndex].quota_limit}`;
                  cy.findByText(strUsage, { exact: false }).should(
                    'be.visible'
                  );
                });
            });
          });
        });
    });

    it('Quota error results in error message being displayed', function () {
      const errorMsg = 'Request failed.';
      mockGetObjectStorageQuotaError(errorMsg).as('getQuotasError');
      cy.visitWithLogin('/account/quotas');
      cy.wait(['@getFeatureFlags', '@getObjectStorageEndpoints']);
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .type(this.selectedDomain);
      ui.autocompletePopper
        .findByTitle(this.selectedDomain, { exact: false })
        .should('be.visible')
        .click();
      cy.wait('@getQuotasError');
      cy.get('[data-qa-error-msg="true"]')
        .should('be.visible')
        .should('have.text', errorMsg);
    });
  });

  describe('Quota Request Increase workflow', () => {
    beforeEach(() => {
      mockAppendFeatureFlags({
        limitsEvolution: {
          enabled: true,
          requestForIncreaseDisabledForInternalAccountsOnly: false,
        },
      }).as('getFeatureFlags');
    });
    // this test executed in context of internal user, using mockApiInternalUser()
    it('Quota Request Increase workflow follows proper sequence', function () {
      const mockProfile = profileFactory.build({
        email: 'mock-user@linode.com',
        restricted: false,
      });
      mockGetProfile(mockProfile).as('getProfile');
      mockApiInternalUser();
      const ticketSummary = 'Increase Object Storage Quota';
      const expectedResults = [
        {
          newQuotaLimit: this.mockQuotas[0].quota_limit * 2,
          description: randomLabel(),
          metric: 'Bytes',
        },
        {
          newQuotaLimit: this.mockQuotas[1].quota_limit * 2,
          description: randomLabel(),
          metric: 'Buckets',
        },
        {
          newQuotaLimit: this.mockQuotas[2].quota_limit * 2,
          description: randomLabel(),
          metric: 'Objects',
        },
      ];
      this.mockQuotas.forEach((mockQuota: Quota, index: number) => {
        cy.visitWithLogin('/account/quotas');
        cy.wait([
          '@getFeatureFlags',
          '@getProfile',
          '@getObjectStorageEndpoints',
        ]);

        // Object Storage Endpoint field is blank
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
        cy.findByPlaceholderText(placeholderText)
          .should('be.visible')
          .should('be.enabled');
        ui.autocomplete
          .findByLabel('Object Storage Endpoint')
          .should('be.visible')
          .type(this.selectedDomain);
        ui.autocompletePopper
          .findByTitle(this.selectedDomain, { exact: false })
          .should('be.visible')
          .click();
        cy.wait(['@getQuotas', '@getQuotaUsages']);

        // Quotas increase request workflow
        ui.actionMenu
          .findByTitle(`Action menu for quota ${mockQuota.quota_name}`)
          .should('be.visible')
          .should('be.enabled')
          .click();
        ui.actionMenuItem
          .findByTitle('Request Increase')
          .should('be.visible')
          .should('be.enabled')
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
            mockCreateSupportTicket(mockTicket).as('createTicket');

            // preview before submission
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
                cy.contains(`${expectedResults[index].description}`);
              });
            });

            ui.button
              .findByTitle('Submit')
              .should('be.visible')
              .scrollIntoView();
            ui.button.findByTitle('Submit').should('be.enabled').click();
            cy.wait('@createTicket').then((xhr) => {
              expect(xhr.request.body?.summary).to.eq(mockTicket.summary);
              // body description appends region id to description so strings don't precisely match
              expect(xhr.request.body?.description).startWith(
                mockTicket.description
              );
            });
          });
        mockGetSupportTicketReplies(mockTicket.id, []).as('getReplies');
        cy.wait('@getReplies');
        cy.url().should('endWith', `support/tickets/${mockTicket.id}`);
        const header = `#${mockTicket.id}: Increase Object Storage Quota`;
        cy.get(`[data-qa-header="${header}"]`).should('be.visible');
        cy.get('h1').should('be.visible');
        cy.contains(`#${mockTicket.id}: ${mockTicket.summary}`).should(
          'be.visible'
        );
      });
    });

    it('Quota error results in error message being displayed', function () {
      const errorMsg = 'Request failed.';
      mockGetObjectStorageQuotaError(errorMsg).as('getQuotasError');
      cy.visitWithLogin('/account/quotas');
      cy.wait('@getObjectStorageEndpoints');
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .type(this.selectedDomain);
      ui.autocompletePopper
        .findByTitle(this.selectedDomain, { exact: false })
        .should('be.visible')
        .click();
      cy.wait('@getQuotasError');
      cy.get('[data-qa-error-msg="true"]')
        .should('be.visible')
        .should('have.text', errorMsg);
    });

    // this test executed in context of internal user, using mockApiInternalUser()
    it('Quota Request Increase error results in error message being displayed', function () {
      mockGetObjectStorageQuotas(this.selectedDomain, this.mockQuotas).as(
        'getQuotas'
      );
      mockApiInternalUser();
      const errorMessage = 'Ticket creation failed.';
      mockCreateSupportTicketError(errorMessage).as('createTicketError');
      cy.visitWithLogin('/account/quotas');
      cy.wait(['@getFeatureFlags', '@getObjectStorageEndpoints']);
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .type(this.selectedDomain);
      ui.autocompletePopper
        .findByTitle(this.selectedDomain, { exact: false })
        .should('be.visible')
        .click();
      // Quotas increase request workflow
      ui.actionMenu
        .findByTitle(`Action menu for quota ${this.mockQuotas[0].quota_name}`)
        .should('be.visible')
        .should('be.enabled')
        .click();
      ui.actionMenuItem
        .findByTitle('Request Increase')
        .should('be.visible')
        .should('be.enabled')
        .click();
      cy.findByLabelText('New Quota (required)')
        .should('be.visible')
        .should('be.enabled')
        .clear();
      cy.focused().type((this.mockQuotas[0].quota_limit + 1).toString());
      cy.findByLabelText('Description (required)')
        .should('be.visible')
        .should('be.enabled')
        .type(randomLabel());
      ui.button.findByTitle('Submit').should('be.visible').scrollIntoView();
      ui.button.findByTitle('Submit').should('be.enabled').click();
      cy.wait('@createTicketError')
        .its('response.statusCode')
        .should('eq', 400);
      cy.findByText(errorMessage).should('be.visible');
    });
  });

  describe('Feature flag determines if Request Increase is enabled', function () {
    it('Request Increase enabled for normal user when requestForIncreaseDisabledForAll is false and requestForIncreaseDisabledForInternalAccountsOnly is false', function () {
      mockAppendFeatureFlags({
        limitsEvolution: {
          enabled: true,
          requestForIncreaseDisabledForAll: false,
          requestForIncreaseDisabledForInternalAccountsOnly: false,
        },
      }).as('getFeatureFlags');
      cy.visitWithLogin('/account/quotas');
      cy.wait(['@getFeatureFlags', '@getObjectStorageEndpoints']);
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .type(this.selectedDomain);
      ui.autocompletePopper
        .findByTitle(this.selectedDomain, { exact: false })
        .should('be.visible')
        .click();

      cy.wait(['@getQuotas', '@getQuotaUsages']);
      ui.actionMenu
        .findByTitle(`Action menu for quota ${this.mockQuotas[1].quota_name}`)
        .should('be.visible')
        .should('be.enabled')
        .click();
      ui.actionMenuItem
        .findByTitle('Request Increase')
        .should('be.visible')
        .should('be.enabled');
    });

    it('Request Increase enabled for internal user when requestForIncreaseDisabledForAll is false and requestForIncreaseDisabledForInternalAccountsOnly is false', function () {
      mockAppendFeatureFlags({
        limitsEvolution: {
          enabled: true,
          requestForIncreaseDisabledForAll: false,
          requestForIncreaseDisabledForInternalAccountsOnly: false,
        },
      }).as('getFeatureFlags');

      mockApiInternalUser();

      cy.visitWithLogin('/account/quotas');
      cy.wait(['@getFeatureFlags', '@getObjectStorageEndpoints']);
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .type(this.selectedDomain);
      ui.autocompletePopper
        .findByTitle(this.selectedDomain, { exact: false })
        .should('be.visible')
        .click();

      cy.wait(['@getQuotas', '@getQuotaUsages']);
      ui.actionMenu
        .findByTitle(`Action menu for quota ${this.mockQuotas[1].quota_name}`)
        .should('be.visible')
        .should('be.enabled')
        .click();
      ui.actionMenuItem
        .findByTitle('Request Increase')
        .should('be.visible')
        .should('be.enabled');
    });

    it('Request Increase disabled for normal user when requestForIncreaseDisabledForAll is true', function () {
      mockAppendFeatureFlags({
        limitsEvolution: {
          enabled: true,
          requestForIncreaseDisabledForAll: true,
        },
      }).as('getFeatureFlags');
      cy.visitWithLogin('/account/quotas');
      cy.wait(['@getFeatureFlags', '@getObjectStorageEndpoints']);
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .type(this.selectedDomain);
      ui.autocompletePopper
        .findByTitle(this.selectedDomain, { exact: false })
        .should('be.visible')
        .click();

      cy.wait(['@getQuotas', '@getQuotaUsages']);
      ui.actionMenu
        .findByTitle(`Action menu for quota ${this.mockQuotas[1].quota_name}`)
        .should('be.visible')
        .should('be.enabled')
        .click();
      ui.actionMenuItem
        .findByTitle('Request Increase')
        .should('be.visible')
        .should('be.disabled');
    });

    it('Request Increase disabled for internal user when requestForIncreaseDisabledForAll is true', function () {
      mockAppendFeatureFlags({
        limitsEvolution: {
          enabled: true,
          requestForIncreaseDisabledForAll: true,
        },
      }).as('getFeatureFlags');
      mockApiInternalUser();
      cy.visitWithLogin('/account/quotas');
      cy.wait(['@getFeatureFlags', '@getObjectStorageEndpoints']);
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .type(this.selectedDomain);
      ui.autocompletePopper
        .findByTitle(this.selectedDomain, { exact: false })
        .should('be.visible')
        .click();

      cy.wait(['@getQuotas', '@getQuotaUsages']);
      ui.actionMenu
        .findByTitle(`Action menu for quota ${this.mockQuotas[1].quota_name}`)
        .should('be.visible')
        .should('be.enabled')
        .click();
      ui.actionMenuItem
        .findByTitle('Request Increase')
        .should('be.visible')
        .should('be.disabled');
    });

    it('Request Increase enabled for normal user when requestForIncreaseDisabledForAll is false and requestForIncreaseDisabledForInternalAccountsOnly is true', function () {
      mockAppendFeatureFlags({
        limitsEvolution: {
          enabled: true,
          requestForIncreaseDisabledForAll: false,
          requestForIncreaseDisabledForInternalAccountsOnly: true,
        },
      }).as('getFeatureFlags');
      cy.visitWithLogin('/account/quotas');
      cy.wait(['@getFeatureFlags', '@getObjectStorageEndpoints']);
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .type(this.selectedDomain);
      ui.autocompletePopper
        .findByTitle(this.selectedDomain, { exact: false })
        .should('be.visible')
        .click();

      cy.wait(['@getQuotas', '@getQuotaUsages']);
      ui.actionMenu
        .findByTitle(`Action menu for quota ${this.mockQuotas[1].quota_name}`)
        .should('be.visible')
        .should('be.enabled')
        .click();
      ui.actionMenuItem
        .findByTitle('Request Increase')
        .should('be.visible')
        .should('be.enabled');
    });

    it('Request Increase disabled for internal user when requestForIncreaseDisabledForAll is false and requestForIncreaseDisabledForInternalAccountsOnly is true', function () {
      mockAppendFeatureFlags({
        limitsEvolution: {
          enabled: true,
          requestForIncreaseDisabledForAll: false,
          requestForIncreaseDisabledForInternalAccountsOnly: true,
        },
      }).as('getFeatureFlags');
      mockApiInternalUser();
      cy.visitWithLogin('/account/quotas');
      cy.wait(['@getFeatureFlags', '@getObjectStorageEndpoints']);
      ui.autocomplete
        .findByLabel('Object Storage Endpoint')
        .should('be.visible')
        .type(this.selectedDomain);
      ui.autocompletePopper
        .findByTitle(this.selectedDomain, { exact: false })
        .should('be.visible')
        .click();

      cy.wait(['@getQuotas', '@getQuotaUsages']);
      ui.actionMenu
        .findByTitle(`Action menu for quota ${this.mockQuotas[1].quota_name}`)
        .should('be.visible')
        .should('be.enabled')
        .click();
      ui.actionMenuItem
        .findByTitle('Request Increase')
        .should('be.visible')
        .should('be.disabled');
    });
  });
});
