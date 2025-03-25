/**
 * @file Cypress intercepts and mocks for Cloud Manager Linode operations.
 */

import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { linodeVlanNoInternetConfig } from 'support/util/linodes';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type {
  Disk,
  Firewall,
  Kernel,
  Linode,
  LinodeIPsResponse,
  LinodeType,
  Volume,
} from '@linode/api-v4';

/**
 * Intercepts POST request to create a Linode.
 *
 * The outgoing request payload is modified to create a Linode without access
 * to the internet.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateLinode = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('linode/instances'), (req) => {
    req.body = {
      ...req.body,
      interfaces: linodeVlanNoInternetConfig,
    };
  });
};

/** Intercepts POST request to create a Linode and mocks an error response.
 *
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
export const mockCreateLinodeAccountLimitError = (
  errorMessage: string,
  statusCode: number = 400
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('linode/instances'),
    makeErrorResponse(errorMessage, statusCode)
  );
};

/**
 * Intercepts POST request to create a Linode.
 *
 * @param linode - a mock linode object
 *
 * @returns Cypress chainable.
 */
export const mockCreateLinode = (linode: Linode): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('linode/instances'),
    makeResponse(linode)
  );
};

/** Intercepts POST request to create a Linode and mocks an error response.
 *
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
export const mockCreateLinodeError = (
  errorMessage: string,
  statusCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('linode/instances'),
    makeErrorResponse(errorMessage, statusCode)
  );
};

/* Intercepts GET request to get a Linode.
 *
 * @param linodeId - ID of Linode to fetch.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLinode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher(`linode/instances/${linodeId}`));
};

/**
 * Intercepts GET request to get all Linodes.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLinodes = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('linode/instances/*'));
};

/**
 * Intercepts GET request to get all Linodes and mocks the response.
 *
 * @param linodes - an array of mock linode objects
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodes = (linodes: Linode[]): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('linode/instances/**'),
    paginateResponse(linodes)
  );
};

/**
 * Intercepts GET request to retrieve Linode details.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLinodeDetails = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher(`linode/instances/${linodeId}*`));
};

/**
 * Intercepts GET request to retrieve Linode details and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param linode - Linode data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeDetails = (
  linodeId: number,
  linode: Linode
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}*`),
    linode
  );
};

/**
 * Intercepts GET request to retrieve a Linode's Volumes and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param volumes - Array of Volumes with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeVolumes = (
  linodeId: number,
  volumes: Volume[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}/volumes*`),
    paginateResponse(volumes)
  );
};

/**
 * Intercepts POST request to rebuild a Linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptRebuildLinode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/rebuild`)
  );
};

/**
 * Intercepts POST request to rebuild a Linode and mocks the response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param linode - Linode for the mocked response
 *
 * @returns Cypress chainable.
 */
export const mockRebuildLinode = (
  linodeId: number,
  linode: Linode
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/rebuild`),
    makeResponse(linode)
  );
};

/**
 * Intercepts POST request to rebuild a Linode and mocks an error response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
export const mockRebuildLinodeError = (
  linodeId: number,
  errorMessage: string,
  statusCode: number = 400
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/rebuild`),
    makeErrorResponse(errorMessage, statusCode)
  );
};

/**
 * Intercepts POST request to reboot a Linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptRebootLinode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/reboot`)
  );
};

/**
 * Intercepts POST request to reboot a Linode into rescue mode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptRebootLinodeIntoRescueMode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/rescue`)
  );
};

/**
 * Intercepts POST request to reboot a Linode into rescue mode and mocks error response.
 *
 * @param linodeId - ID of Linode to reboot into rescue mode.
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
export const mockRebootLinodeIntoRescueModeError = (
  linodeId: number,
  errorMessage: string,
  statusCode: number = 400
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/rescue`),
    makeErrorResponse(errorMessage, statusCode)
  );
};

/**
 * Intercepts GET request to retrieve a Linode's Disks
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLinodeDisks = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher(`linode/instances/${linodeId}/disks*`));
};

/**
 * Intercepts GET request to retrieve a Linode's Disks and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param disks - Array of Disks with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeDisks = (
  linodeId: number,
  disks: Disk[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}/disks*`),
    paginateResponse(disks)
  );
};

/**
 * Intercepts DELETE request to delete a Linode's Disks
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptDeleteDisks = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`linode/instances/${linodeId}/disks/*`)
  );
};

/**
 * Intercepts POST request to add a Linode's Disks
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptAddDisks = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher(`linode/instances/${linodeId}/disks`));
};

/**
 * Intercepts POST request to resize a Linode's Disks
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptResizeDisks = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/disks/*/resize`)
  );
};

/**
 * Intercepts DELETE request to delete linode and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteLinodes = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`linode/instances/${linodeId}`),
    makeResponse({})
  );
};

/**
 * Intercepts DELETE request to delete linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptDeleteLinode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', apiMatcher(`linode/instances/${linodeId}`));
};

/**
 * Intercepts GET request to fetch Linode types and mocks the response.
 *
 * @param types - Linode types with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeTypes = (
  types: LinodeType[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('linode/types*'),
    paginateResponse(types)
  );
};

/**
 * Intercepts GET request to fetch a Linode type and mocks the response.
 *
 * @param type - Linode type with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeType = (
  type: LinodeType
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/types/${type.id}`),
    makeResponse(type)
  );
};

/**
 * Intercepts POST request to clone a Linode.
 *
 * @param linodeId - ID of Linode being cloned.
 *
 * @returns Cypress chainable.
 */
export const interceptCloneLinode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher(`linode/instances/${linodeId}/clone`));
};

/**
 * Intercepts POST request to clone a Linode and mock responses.
 *
 * @param linodeId - ID of Linode being cloned.
 *
 * @returns Cypress chainable.
 */
export const mockCloneLinode = (
  linodeId: number,
  linode: Linode
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/clone`),
    makeResponse(linode)
  );
};

/**
 * Intercepts POST request to enable backups for a Linode.
 *
 * @param linodeId - ID of Linode for which to enable backups.
 *
 * @returns Cypress chainable.
 */
export const interceptEnableLinodeBackups = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/backups/enable`)
  );
};

/**
 * Intercepts POST request to enable backups for a Linode and mocks response.
 *
 * @param linodeId - ID of Linode for which to enable backups.
 *
 * @returns Cypress chainable.
 */
export const mockEnableLinodeBackups = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/backups/enable`),
    {}
  );
};

/**
 * Intercepts POST request to create a Linode snapshot.
 *
 * @param linodeId - ID of Linode for which to create snapshot.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateLinodeSnapshot = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/backups`)
  );
};

/**
 * Intercepts POST request to migrate a Linode.
 *
 * @param linodeId - ID of Linode being migrated.
 *
 * @returns Cypress chainable.
 */
export const interceptMigrateLinode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/migrate`)
  );
};

/**
 * Intercepts POST request to migrate a Linode.
 *
 * @param linodeId - Linode ID for which to mock migration.
 *
 * @returns Cypress chainable.
 */
export const mockMigrateLinode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/migrate`),
    {}
  );
};

/**
 * Intercepts GET request to fetch Linode kernels and mocks response.
 *
 * @param mockKernels - Array of Kernel objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeKernels = (
  mockKernels: Kernel[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('linode/kernels*'),
    paginateResponse(mockKernels)
  );
};

/**
 * Intercepts GET request to fetch a Linode kernel and mocks response.
 *
 * @param kernelId - ID of Kernel for which to mock response.
 * @param mockKernel - Kernel object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeKernel = (
  kernelId: string,
  mockKernel: Kernel
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/kernels/${kernelId}`),
    makeResponse(mockKernel)
  );
};

/**
 * Intercepts POST request to get a Linode Resize.
 *
 * @param linodeId - ID of Linode to fetch.
 *
 * @returns Cypress chainable.
 */
export const interceptLinodeResize = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/resize`)
  );
};

/**
 * Mocks GET request to get a Linode's firewalls.
 *
 * @param linodeId - ID of Linode to get firewalls associated with it.
 * @param firewalls - the firewalls with which to mock the response.
 *
 * @returns Cypress Chainable.
 */
export const mockGetLinodeFirewalls = (
  linodeId: number,
  firewalls: Firewall[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}/firewalls`),
    paginateResponse(firewalls)
  );
};

/**
 * Mocks GET request to get a Linode's IP addresses.
 *
 * @param linodeId - ID of Linode to get IP addresses for.
 * @param ipAddresses: the IP Addresses with which to mock the response.
 *
 * @returns Cypress Chainable.
 */
export const mockGetLinodeIPAddresses = (
  linodeId: number,
  ipAddresses: LinodeIPsResponse
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}/ips`),
    makeResponse(ipAddresses)
  );
};

/**
 * Intercepts POST request to cancel backups for a Linode.
 *
 * @param linodeId - ID of Linode for which to enable backups.
 *
 * @returns Cypress chainable.
 */
export const interceptCancelLinodeBackups = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/backups/cancel`)
  );
};
