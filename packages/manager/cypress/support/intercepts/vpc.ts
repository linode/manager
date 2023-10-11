/**
 * @files Cypress intercepts and mocks for VPC API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { Subnet, VPC } from '@linode/api-v4';
import { makeResponse } from 'support/util/response';

/**
 * Intercepts GET request to fetch a VPC and mocks response.
 *
 * @param vpc - VPC with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetVPC = (vpc: VPC): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher(`vpcs/${vpc.id}`), makeResponse(vpc));
};

/**
 * Intercepts GET request to fetch VPCs and mocks response.
 *
 * @param vpcs - Array of VPCs with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetVPCs = (vpcs: VPC[]): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('vpcs*'), paginateResponse(vpcs));
};

/**
 * Intercepts PUT request to update a VPC and mocks response.
 *
 * @param vpcId - ID of updated VPC for which to mock response.
 * @param updatedVPC - Updated VPC data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateVPC = (
  vpcId: number,
  updatedVPC: VPC
): Cypress.Chainable<null> => {
  return cy.intercept('PUT', apiMatcher(`vpcs/${vpcId}`), updatedVPC);
};

/**
 * Intercepts DELETE request to delete a VPC and mocks response.
 *
 * @param vpcId - ID of deleted VPC for which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteVPC = (vpcId: number): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', apiMatcher(`vpcs/${vpcId}`), {});
};

/**
 * Intercepts GET request to get a VPC's subnets and mocks response.
 *
 * @param vpcId - ID of VPC for which to mock response.
 * @param subnets - Array of subnets for which to mock response
 *
 * @returns Cypress chainable.
 */
export const mockGetSubnets = (
  vpcId: number,
  subnets: Subnet[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`vpcs/${vpcId}/subnets*`),
    paginateResponse(subnets)
  );
};

/**
 * Intercepts DELETE request to delete a subnet of a VPC and mocks response
 *
 * @param vpcId - ID of VPC for which to mock response.
 * @param subnetId - ID of subnet for which to mock response
 *
 * @returns Cypress chainable.
 */
export const mockDeleteSubnet = (
  vpcId: number,
  subnetId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`vpcs/${vpcId}/subnets/${subnetId}`),
    {}
  );
};

/**
 * Intercepts POST request to create a subnet for a VPC and mocks response.
 *
 * @param vpcId - ID of VPC for which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateSubnet = (vpcId: number): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher(`vpcs/${vpcId}/subnets`), {});
};

/**
 * Intercepts PUT request to edit a subnet for a VPC and mocks response
 *
 * @param vpcId: ID of VPC for which to mock response
 * @param subnetId: ID of subnet for which to mock response
 * @param editedSubnet Updated subnet data with which to mock response
 *
 * @returns Cypress chainable
 */
export const mockEditSubnet = (
  vpcId: number,
  subnetId: number,
  editedSubnet: Subnet
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`vpcs/${vpcId}/subnets/${subnetId}`),
    editedSubnet
  );
};
