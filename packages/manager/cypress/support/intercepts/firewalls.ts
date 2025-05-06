/**
 * @file Cypress intercepts and mocks for Firewall API requests.
 */
import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type {
  Firewall,
  FirewallDevice,
  FirewallSettings,
  FirewallTemplate,
} from '@linode/api-v4';
import type { APIErrorContents } from 'support/util/errors';

/**
 * Intercepts GET request to fetch Firewalls.
 *
 * @returns Cypress chainable.
 */
export const interceptGetFirewalls = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('networking/firewalls*'));
};

/**
 * Mocks the GET request to get a single Firewall
 *
 * @returns Cypress chainable.
 */
export const mockGetFirewall = (
  firewallId: number,
  firewall: Firewall
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`networking/firewalls/${firewallId}`),
    firewall
  );
};

/**
 * Intercepts GET request to fetch Firewalls and mocks response.
 *
 * @param firewalls - Array of Firewalls with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetFirewalls = (
  firewalls: Firewall[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('networking/firewalls*'),
    paginateResponse(firewalls)
  );
};

/**
 * Intercepts GET request to fetch a Linode Interface's Firewalls
 *
 * @param linodeId - The ID of the Linode
 * @param interfaceId - The ID of the Linode Interface
 * @param firewalls - The Firewalls assigned to the LinodeInterface
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeInterfaceFirewalls = (
  linodeId: number,
  interfaceId: number,
  firewalls: Firewall[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(
      `linode/instances/${linodeId}/interfaces/${interfaceId}/firewalls`
    ),
    paginateResponse(firewalls)
  );
};

/**
 * Intercepts POST request to create a Firewall and mocks response.
 *
 * @param firewall - A Firewall with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateFirewall = (
  firewall: Firewall
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('networking/firewalls*'), firewall);
};

/**
 * Intercepts POST request to create a Firewall and mocks an error response.
 *
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
export const mockCreateFirewallError = (
  errorMessage: string,
  statusCode: number = 400
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`networking/firewalls*`),
    makeErrorResponse(errorMessage, statusCode)
  );
};

/**
 * Intercepts POST request to create a Firewall.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateFirewall = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('networking/firewalls'));
};

/**
 * Intercepts PUT request to update a Firewall's rules.
 *
 * @returns Cypress chainable.
 */
export const interceptUpdateFirewallRules = (
  firewallId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`networking/firewalls/${firewallId}/rules`)
  );
};

/**
 * Intercepts POST request to update a Firewall's Linodes.
 *
 * @returns Cypress chainable.
 */
export const interceptUpdateFirewallLinodes = (
  firewallId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`networking/firewalls/${firewallId}/devices`)
  );
};

/**
 * Mocks the GET request to get a Firewall's devices
 *
 * @returns Cypress chainable.
 */
export const mockGetFirewallDevices = (
  firewallId: number,
  firewallDevices: FirewallDevice[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`networking/firewalls/${firewallId}/devices*`),
    paginateResponse(firewallDevices)
  );
};

/**
 * Mocks the POST request to add a Firewall device.
 *
 * @returns Cypress chainable.
 */
export const mockAddFirewallDevice = (
  firewallId: number,
  firewallDevice: FirewallDevice
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`networking/firewalls/${firewallId}/devices`),
    firewallDevice
  );
};

/**
 * Intercepts POST request to add a firewall device and mocks an API error response.
 *
 * @param errorContents - API error with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockAddFirewallDeviceError = (
  firewallId: number,
  errorContents: APIErrorContents = 'Unable to add firewall device.',
  statusCode: number = 400
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`networking/firewalls/${firewallId}/devices`),
    makeErrorResponse(errorContents, statusCode)
  );
};

/**
 * Intercepts GET request to fetch a Firewall template and mocks response.
 *
 * @param template - Template with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetFirewallTemplate = (
  template: FirewallTemplate
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`networking/firewalls/templates/${template.slug}`),
    template
  );
};

/**
 * Intercepts GET request to fetch Firewall templates and mocks response.
 *
 * @param templates - Array of templates with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetFirewallTemplates = (
  templates: FirewallTemplate[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`networking/firewalls/templates*`),
    paginateResponse(templates)
  );
};

/**
 * Intercepts GET request to fetch Firewall settings and mocks response.
 *
 * @param settings - Firewall settings object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetFirewallSettings = (
  settings: FirewallSettings
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('networking/firewalls/settings'),
    makeResponse(settings)
  );
};

/**
 * Intercepts PUT request to update Firewall settings and mocks response.
 *
 * @param settings - Firewall settings object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateFirewallSettings = (
  settings: FirewallSettings
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher('networking/firewalls/settings'),
    makeResponse(settings)
  );
};

/**
 * Intercepts PUT request to update Firewall settings and mocks an API error response.
 *
 * @param errorContents - API error with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateFirewallSettingsError = (
  errorContents: APIErrorContents = 'An unknown error has occurred',
  statusCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher('networking/firewalls/settings'),
    makeErrorResponse(errorContents, statusCode)
  );
};
