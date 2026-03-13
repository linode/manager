import { regionFactory } from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
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

const mockFeatureFlags = {
  objSummaryPage: true,
};

const placeholderText = 'Select an Object Storage S3 endpoint';

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
    quota_type: 'obj-bytes',
    description: randomLabel(50),
    endpoint_type: mockSelectedEndpoint.endpoint_type,
    quota_limit: 10,
    quota_name: 'Total Capacity',
    resource_metric: 'byte',
    s3_endpoint: selectedDomain,
  }),
  quotaFactory.build({
    quota_id: `obj-buckets-${selectedDomain}`,
    quota_type: 'obj-buckets',
    description: randomLabel(50),
    endpoint_type: mockSelectedEndpoint.endpoint_type,
    quota_limit: 78,
    quota_name: 'Number of Objects',
    resource_metric: 'bucket',
    s3_endpoint: selectedDomain,
  }),
  quotaFactory.build({
    quota_id: `obj-objects-${selectedDomain}`,
    quota_type: 'obj-objects',
    description: randomLabel(50),
    endpoint_type: mockSelectedEndpoint.endpoint_type,
    quota_limit: 400,
    quota_name: 'Number of Buckets',
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

authenticate();
describe('Object storage summary page test', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(mockFeatureFlags).as('getFeatureFlags');

    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );

    cy.wrap(selectedDomain).as('selectedDomain');
    cy.wrap(mockEndpoints).as('mockEndpoints');
    cy.wrap(mockQuotas).as('mockQuotas');
    cy.wrap(mockQuotaUsages).as('mockQuotaUsages');

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
  });

  it('should display table with user quotas', () => {
    cy.visitWithLogin('/object-storage/summary');

    cy.wait(['@getFeatureFlags', '@getObjectStorageEndpoints']);

    // Object Storage Endpoint field is blank
    cy.findByPlaceholderText(placeholderText)
      .should('be.visible')
      .should('be.enabled');

    const endpointSelect = ui.autocomplete.findByLabel('');
    endpointSelect.should('be.visible').type(selectedDomain);
    ui.autocompletePopper
      .findByTitle(selectedDomain, { exact: false })
      .should('be.visible')
      .click();
    endpointSelect.click();

    cy.wait(['@getQuotas', '@getQuotaUsages']);

    cy.findByTestId('table-endpoint-summary')
      .find('tbody')
      .within(() => {
        cy.get('[data-testid="table-row-empty"]').should('not.exist');

        cy.get('td')
          .should('have.length', 3)
          .each((_, index) => {
            cy.get('td')
              .eq(index)
              .within(() => {
                const { usage } = mockQuotaUsages[index];
                const { quota_limit, resource_metric } = mockQuotas[index];

                cy.findByText(selectedDomain, { exact: false }).should(
                  'be.visible'
                );
                cy.findByText(`${usage} of ${quota_limit}`, {
                  exact: false,
                }).should('be.visible');
                cy.findByText(resource_metric, {
                  exact: false,
                }).should('be.visible');
              });
          });
      });
  });
});
