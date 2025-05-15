import {
  CreateFirewallSchema,
  FirewallDeviceSchema,
  UpdateFirewallSchema,
  UpdateFirewallSettingsSchema,
} from '@linode/validation/lib/firewalls.schema';

import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  CreateFirewallPayload,
  Firewall,
  FirewallDevice,
  FirewallDevicePayload,
  FirewallRules,
  FirewallSettings,
  FirewallTemplate,
  FirewallTemplateSlug,
  UpdateFirewallPayload,
  UpdateFirewallRules,
  UpdateFirewallSettings,
} from './types';

/**
 * getFirewalls
 *
 * Returns a paginated list of all Cloud Firewalls on this account.
 */
export const getFirewalls = (params?: Params, filter?: Filter) =>
  Request<Page<Firewall>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
    setURL(`${BETA_API_ROOT}/networking/firewalls`),
  );

/**
 * getFirewall
 *
 * Get a specific Firewall resource by its ID. The Firewall's Devices will not be
 * returned in the response. Use getFirewallDevices() to view the Devices.
 *
 */
export const getFirewall = (firewallID: number) =>
  Request<Firewall>(
    setMethod('GET'),
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/${encodeURIComponent(firewallID)}`,
    ),
  );

/**
 * createFirewall
 *
 *  Creates a Firewall to filter network traffic. Use the `rules` property to
 *  create inbound and outbound access rules. Use the `devices` property to assign the
 *  Firewall to a Linode service.
 *  A Firewall can be assigned to multiple Linode services, and up to three active Firewalls
 *  can be assigned to a single Linode service. Additional disabled Firewalls can be
 *  assigned to a service, but they cannot be enabled if three other active Firewalls
 *  are already assigned to the same service.
 */
export const createFirewall = (data: CreateFirewallPayload) =>
  Request<Firewall>(
    setMethod('POST'),
    setData(data, CreateFirewallSchema),
    setURL(`${BETA_API_ROOT}/networking/firewalls`),
  );

/**
 * updateFirewall
 *
 * Updates the Cloud Firewall with the provided ID. Only label, tags, and status can be updated
 * through this method.
 *
 */
export const updateFirewall = (
  firewallID: number,
  data: UpdateFirewallPayload,
) =>
  Request<Firewall>(
    setMethod('PUT'),
    setData(data, UpdateFirewallSchema),
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/${encodeURIComponent(firewallID)}`,
    ),
  );

/**
 * enableFirewall
 *
 * Convenience method for enabling a Cloud Firewall. Calls updateFirewall internally
 * with { status: 'enabled' }
 *
 */
export const enableFirewall = (firewallID: number) =>
  updateFirewall(firewallID, { status: 'enabled' });

/**
 * disableFirewall
 *
 * Convenience method for disabling a Cloud Firewall. Calls updateFirewall internally
 * with { status: 'disabled' }
 *
 */
export const disableFirewall = (firewallID: number) =>
  updateFirewall(firewallID, { status: 'disabled' });

/**
 * deleteFirewall
 *
 * Deletes a single Cloud Firewall.
 *
 */
export const deleteFirewall = (firewallID: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/${encodeURIComponent(firewallID)}`,
    ),
  );

// #region Firewall Rules

/**
 * getFirewallRules
 *
 * Returns the current set of rules for a single Cloud Firewall.
 */
export const getFirewallRules = (
  firewallID: number,
  params?: Params,
  filter?: Filter,
) =>
  Request<Page<FirewallRules>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/${encodeURIComponent(
        firewallID,
      )}/rules`,
    ),
  );

/**
 * updateFirewallRules
 *
 * Updates the inbound and outbound Rules for a Firewall. Using this endpoint will
 * replace all of a Firewall's ruleset with the Rules specified in your request.
 */
export const updateFirewallRules = (
  firewallID: number,
  data: UpdateFirewallRules,
) =>
  Request<FirewallRules>(
    setMethod('PUT'),
    setData(data), // Validation is too complicated for these; leave it to the API.
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/${encodeURIComponent(
        firewallID,
      )}/rules`,
    ),
  );

// #region Devices

/**
 * getFirewallDevices
 *
 * Returns a paginated list of a Firewall's Devices. A Firewall Device assigns a
 * Firewall to a Linode service (referred to as the Device's `entity`).
 */
export const getFirewallDevices = (
  firewallID: number,
  params?: Params,
  filter?: Filter,
) =>
  Request<Page<FirewallDevice>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/${encodeURIComponent(
        firewallID,
      )}/devices`,
    ),
  );

/**
 * getFirewallDevice
 *
 * Returns information about a single Firewall Device. A Firewall Device assigns a
 * Firewall to a Linode service (referred to as the Device's `entity`).
 */
export const getFirewallDevice = (firewallID: number, deviceID: number) =>
  Request<FirewallDevice>(
    setMethod('GET'),
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/${encodeURIComponent(
        firewallID,
      )}/devices/${encodeURIComponent(deviceID)}`,
    ),
  );

/**
 * addFirewallDevice
 *
 *  Creates a Firewall Device, which assigns a Firewall to a Linode service (referred to
 *  as the Device's `entity`).
 *  A Firewall can be assigned to multiple Linode services, and up to three active Firewalls can
 *  be assigned to a single Linode service. Additional disabled Firewalls can be
 *  assigned to a service, but they cannot be enabled if three other active Firewalls
 *  are already assigned to the same service.
 *  Creating a Firewall Device will apply the Rules from a Firewall to a Linode service.
 *  A `firewall_device_add` Event is generated when the Firewall Device is added successfully.
 */
export const addFirewallDevice = (
  firewallID: number,
  data: FirewallDevicePayload,
) =>
  Request<FirewallDevice>(
    setMethod('POST'),
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/${encodeURIComponent(
        firewallID,
      )}/devices`,
    ),
    setData(data, FirewallDeviceSchema),
  );

/**
 * deleteFirewallDevice
 *
 *  Removes a Firewall Device, which removes a Firewall from the Linode service it was
 *  assigned to by the Device. This will remove all of the Firewall's Rules from the Linode
 *  service. If any other Firewalls have been assigned to the Linode service, then those Rules
 *  will remain in effect.
 */
export const deleteFirewallDevice = (firewallID: number, deviceID: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/${encodeURIComponent(
        firewallID,
      )}/devices/${encodeURIComponent(deviceID)}`,
    ),
  );

/**
 * getFirewallSettings
 *
 * Returns current interface default firewall settings
 */
export const getFirewallSettings = () =>
  Request<FirewallSettings>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/networking/firewalls/settings`),
  );

/**
 * updateFirewallSettings
 *
 * Update which firewalls should be the interface default firewalls
 */
export const updateFirewallSettings = (data: UpdateFirewallSettings) =>
  Request<FirewallSettings>(
    setMethod('PUT'),
    setURL(`${BETA_API_ROOT}/networking/firewalls/settings`),
    setData(data, UpdateFirewallSettingsSchema),
  );

// #region Templates

/**
 * getTemplates
 *
 * Returns a paginated list of all firewall templates on this account.
 */
export const getTemplates = () =>
  Request<Page<FirewallTemplate>>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/networking/firewalls/templates`),
  );

/**
 * getTemplate
 *
 * Get a specific firewall template by its slug.
 */
export const getTemplate = (templateSlug: FirewallTemplateSlug) =>
  Request<FirewallTemplate>(
    setMethod('GET'),
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/templates/${encodeURIComponent(
        templateSlug,
      )}`,
    ),
  );
