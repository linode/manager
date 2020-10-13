import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../request';
import { ResourcePage as Page } from '../types';
import {
  CreateFirewallSchema,
  FirewallDeviceSchema,
  UpdateFirewallSchema
} from './firewalls.schema';
import {
  CreateFirewallPayload,
  Firewall,
  FirewallDevice,
  FirewallDevicePayload,
  FirewallRules,
  UpdateFirewallPayload
} from './types';

// FIREWALLS

/**
 * getFirewalls
 *
 * Returns a paginated list of all Cloud Firewalls on this account.
 */
export const getFirewalls = (params?: any, filters?: any) =>
  Request<Page<Firewall>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/networking/firewalls`)
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
    setURL(`${BETA_API_ROOT}/networking/firewalls/${firewallID}`)
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
    setURL(`${BETA_API_ROOT}/networking/firewalls`)
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
  data: UpdateFirewallPayload
) =>
  Request<Firewall>(
    setMethod('PUT'),
    setData(data, UpdateFirewallSchema),
    setURL(`${BETA_API_ROOT}/networking/firewalls/${firewallID}`)
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
    setURL(`${BETA_API_ROOT}/networking/firewalls/${firewallID}`)
  );

// FIREWALL RULES

/**
 * getFirewallRules
 *
 * Returns the current set of rules for a single Cloud Firewall.
 */
export const getFirewallRules = (
  firewallID: number,
  params?: any,
  filters?: any
) =>
  Request<Page<FirewallRules>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/networking/firewalls/${firewallID}/rules`)
  );

/**
 * updateFirewallRules
 *
 * Updates the inbound and outbound Rules for a Firewall. Using this endpoint will
 * replace all of a Firewall's ruleset with the Rules specified in your request.
 */
export const updateFirewallRules = (firewallID: number, data: FirewallRules) =>
  Request<FirewallRules>(
    setMethod('PUT'),
    setData(data), // Validation is too complicated for these; leave it to the API.
    setURL(`${BETA_API_ROOT}/networking/firewalls/${firewallID}/rules`)
  );

// DEVICES

/**
 * getFirewallDevices
 *
 * Returns a paginated list of a Firewall's Devices. A Firewall Device assigns a
 * Firewall to a Linode service (referred to as the Device's `entity`).
 */
export const getFirewallDevices = (
  firewallID: number,
  params?: any,
  filters?: any
) =>
  Request<Page<FirewallDevice>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/networking/firewalls/${firewallID}/devices`)
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
      `${BETA_API_ROOT}/networking/firewalls/${firewallID}/devices/${deviceID}`
    )
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
  data: FirewallDevicePayload
) =>
  Request<FirewallDevice>(
    setMethod('POST'),
    setURL(`${BETA_API_ROOT}/networking/firewalls/${firewallID}/devices`),
    setData(data, FirewallDeviceSchema)
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
      `${BETA_API_ROOT}/networking/firewalls/${firewallID}/devices/${deviceID}`
    )
  );
