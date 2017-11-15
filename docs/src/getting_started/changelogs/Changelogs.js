import React from 'react';
import { Link } from 'react-router';

import { API_VERSION } from '~/constants';

export default function Authentication() {
  return (
    <section className="Article">
      <h1>Changelogs</h1>
      <section>
        <p>
        The API V4 is currently in beta.  There will be regular releases that may
        introduce breaking changes.  The Developers site contains all changes to
        API V4 since 2017-09-18.  Please check here regularly for updates.
        </p>
      </section>
      <section>
        <h2>2017-11-20</h2>
        <hr /><br />
        <b>Breaking Changes:</b><br />
        <ul>
          <li>Reworked UserGrant system
            <ul>
              <li>Three Grant levels are now enforced: No grants, read_only, and read_write</li>
              <li>read_only allows access to GET endpoints</li>
              <li>read_write is equivalent to legacy "all" grant</li>
              <li>Legacy "all" or "access" grants are treated as read_write</li>
            </ul>
          </li>
          <li>Changed GET /account/users/:username/grants
            <ul>
              <li>Grants response objects now always include "id", "label" and "permissions"</li>
              <li>"permissions" can be null or an enum of either "read_only" or "read_write"</li>
            </ul>
          </li>
          <li>Changed PUT /account/users/:username/grants
            <ul>
              <li>Grants now accepted in the new format detailed above</li>
            </ul>
          </li>
          <li>Changed GET /profile/grants
            <ul>
              <li>Grants returned in new format detailed above</li>
            </ul>
          </li>
        </ul>
        <b>Changes:</b>
        <ul>
          <li>Added support for CAA Domain records</li>
          <li>Changed POST /linode/instances/:id/disks
            <ul>
              <li>Now accepts "image" - an image ID to deploy from</li>
            </ul>
          </li>
        </ul>
      </section>
      <section>
        <h2>2017-10-23</h2>
        <hr /><br />
        <b>Breaking Changes:</b><br />
        <ul>
          <li>Changed POST /account/payments
            <ul>
              <li>Now accepts "usd" as a string representing a dollar amount, including cents</li>
              <li>Valid values include "0.10", "10.00", "100.20", and "$1.00"</li>
              <li>Invalid values include 10, 10.01, "10", "10.001", and "10.0"</li>
            </ul>
          </li>
        </ul>
        <b>Changes:</b><br />
        <ul>
          <li>Added GET /account/notifications
            <ul>
              <li>Read-only collection of Notification objects</li>
              <li>Returns important information about your account that may require action</li>
            </ul>
          </li>
          <li>Added GET /images
            <ul>
              <li>Lists images on your account</li>
            </ul>
          </li>
          <li>Added GET /images/:id
            <ul>
              <li>View a single image on your account</li>
            </ul>
          </li>
          <li>Added PUT /images/:id
            <ul>
              <li>Update an image on your account</li>
            </ul>
          </li>
          <li>Added DELETE /images/:id
            <ul>
              <li>Deleted an image you own</li>
            </ul>
          </li>
          <li>Added POST /linode/instances/:id/disks/:id/imagize
            <ul>
              <li>Creates a new image from a disk you own</li>
            </ul>
          </li>
          <li>Added GET /longview/clients
            <ul>
              <li>Returns a list of Longview clients on your account</li>
            </ul>
          </li>
          <li>Added POST /longview/clients
            <ul>
              <li>Creates a new Longview client on your account</li>
            </ul>
          </li>
          <li>Added GET /longview/clients/:id
            <ul>
              <li>Returns information on a single Longview client</li>
            </ul>
          </li>
          <li>Added PUT /longview/clients/:id
            <ul>
              <li>Update a single Longview client</li>
            </ul>
          </li>
          <li>Added DELETE /longview/clients/:id
            <ul>
              <li>Removes a longview client from your account</li>
            </ul>
          </li>
          <li>Added GET /longview/subscriptions
            <ul>
              <li>Returns all available longview subscription tiers</li>
            </ul>
          </li>
          <li>Added GET /longview/subscriptions/:id
            <ul>
              <li>Returns information one longview subscription tier</li>
            </ul>
          </li>
          <li>Changed GET /account/settings
            <ul>
              <li>Added "longview_subscription" - the tier at which you are subscribed
              to longview</li>
            </ul>
          </li>
          <li>Changed PUT /account/settings
            <ul>
              <li>Sending in "null" or an id to "longview_subscription" changes your longview
              subscription tier.</li>
            </ul>
          </li>
          <li>Change POST /linode/instances
            <ul>
              <li>Now accepts image - the ID of an image to deploy the linode with</li>
              <li>Only one source attribute may be provided</li>
            </ul>
          </li>
          <li>Changed POST /linode/instances/:id/rebuild
            <ul>
              <li>Now accepts image - the ID of an image to rebuild the linode with</li>
              <li>Only one source attribute may be provided</li>
            </ul>
          </li>
          <li>Added events for enabling/disabling TFA</li>
          <li>Added Longview and Image grants to GET /users/:id/grants and GET /profile/grants
            <ul>
              <li>Response now includes "longview" attribute whose value is an array of
              grants your user has that relate to longview clients</li>
              <li>Response now includes an "images" attribute whose value is an array of
              grants your user has that relate to images</li>
              <li>Only applies to restricted users</li>
            </ul>
          </li>
          <li>Event objects may now have Longview clients or Images as their entities</li>
        </ul>
      </section>
      <section>
        <h2>2017-10-04</h2>
        <hr /><br />
        <b>Breaking Changes:</b><br />
        <ul>
          <li> EventType has changed from "blockstorage_*" to "volume_*"</li>
          <li> Changed POST linode/instances/:id/configs
            <ul>
              <li> Removed root_device_ro </li>
              <li> Now accepts "helpers", a dict accepting any/all of "updatedb_disabled",
              "distro", "modules_dep", "network", and "devtmpfs_automount" </li>
              <li> Removed devtmpfs_automount (now in helpers envelope) </li>
            </ul>
          </li>
          <li> Changed POST linode/instances/:id/disks
            <ul>
              <li> root_ssh_key changed to "authorized_keys", now accepts a list of keys instead
              of a single string key </li>
            </ul>
          </li>
          <li> Changed POST linode/instances
            <ul>
              <li> root_ssh_key changed to "authorized_keys", now accepts a list of keys instead
              of a single string key </li>
            </ul>
          </li>
          <li> Changed POST linode/instances/:id/rebuild
            <ul>
              <li> root_ssh_key changed to "authorized_keys", now accepts a list of keys instead
              of a single string key </li>
            </ul>
          </li>
          <li> Changed POST linode/instances/:id/rescue
            <ul>
              <li> disks changed to "devices", now accepts device mappings in the same format
              as POST linode/instances/:id/configs </li>
            </ul>
          </li>
          <li> Changed Linode object
            <ul>
              <li> Moved "disk", "memory", "storage", "transfer_total", and "vcpus" into a
              "specs" envelope </li>
              <li> transfer_total => transfer in linode specs </li>
              <li> transfer_in => network_in </li>
              <li> transfer_out => network_out </li>
            </ul>
          </li>
          <li> Changed LinodeConfig object
            <ul>
              <li> Removed root_device_ro </li>
            </ul>
          </li>
          <li> Changed LinodeType object
            <ul>
              <li> Moved backups_option.price_hourly to addons.backups.price.hourly </li>
              <li> Moved backups_option.price_monthly to addons.backups.price.monthly </li>
              <li> Moved price_hourly to price.hourly </li>
              <li> Moved price_monthly to price.monthly </li>
            </ul>
          </li>
          <li> Changed OAuthToken
            <ul>
              <li> Removed client envelope </li>
              <li> Removed type </li>
            </ul>
          </li>
          <li> Changed account/tokens
            <ul>
              <li> Endpoint moved to profile/tokens </li>
              <li> GET now only returns Personal Access Tokens </li>
            </ul>
          </li>
          <li> Changed account/clients
            <ul>
              <li> Endpoint moved to account/oauth-clients </li>
              <li> Collection now allows access to all clients for all users on your account
              if you are an unrestricted user </li>
            </ul>
          </li>
        </ul>
        <b>Changes:</b><br />
        <ul>
          <li> Added profile/apps
            <ul>
              <li> Collection of authorized third-party applications </li>
            </ul>
          </li>
          <li> OAuthClient now has a "public" attribute
            <ul>
              <li> "public" is an optional argument to POST account/clients that
              defaults to False </li>
            </ul>
          </li>
          <li> Added POST account/credit-card
            <ul>
              <li> Updates current payment method on file </li>
            </ul>
          </li>
          <li> Added GET account/payments
            <ul>
              <li> Returns a list of all payments made for your account </li>
            </ul>
          </li>
          <li> Added GET account/payments/:id
            <ul>
              <li> Returns information about a single payment made for your account </li>
            </ul>
          </li>
          <li> Added POST linode/volumes/:id/clone </li>
          <li> Changed Disk Status
            <ul>
              <li> Now always one of "ready", "not ready", or "deleting" </li>
            </ul>
          </li>
        </ul>
      </section>
      <section>
        <h2>2017-09-18</h2>
        <hr /><br />
        <b>Breaking Changes:</b><br />
        <ul>
          <li>Pagination envelope has changed
            <ul>
              <li> total_pages => pages</li>
              <li> total_results => results</li>
              <li> endpoint-specific key is now always "data"</li>
            </ul>
          </li>
          <li>Region, Distribution, Type, and Kernel objects are now returned as slugs
            <ul>
              <li> Previously, entire object was returned as part of other responses</li>
            </ul>
          </li>
          <li>POST linode/instances and POST linode/rebuild automatically issue a boot job
            <ul>
              <li> This behavior can be suppressed by sending "boot": false in the request</li>
            </ul>
          </li>
          <li>Changed POST linode/instances
            <ul>
              <li> with_backups => backups_enabled</li>
              <li> Now accepts "booted" - defaults to true if distribution is provided</li>
            </ul>
          </li>
          <li>Changed POST  linode/instances/:id/clone
            <ul>
              <li> with_backups => backups_enabled</li>
            </ul>
          </li>
          <li>Changed POST linode/instances/:id/rebuild
            <ul>
              <li> Now accepts "booted" - defaults to true</li>
            </ul>
          </li>
          <li>Changed LinodeNetworkingResponse
            <ul>
              <li> region is now a slug instead of a nested object</li>
            </ul>
          </li>
          <li>Changed IPv6 object
            <ul>
              <li> region is now a slug instead of a nested object</li>
            </ul>
          </li>
          <li>Changed Invoice object
            <ul>
              <li> Removed "paid"</li>
              <li> Removed "overdue"</li>
            </ul>
          </li>
          <li>Changed Region object
            <ul>
              <li> Removed "label"</li>
            </ul>
          </li>
          <li>Changed Backup object
            <ul>
              <li> regions is now a slug instead of a nested object</li>
            </ul>
          </li>
          <li>Changed Distribution object
            <ul>
              <li> Removed "created"</li>
              <li> Added "updated"</li>
              <li> minimum_storage_size => disk_minimum</li>
              <li> x64 => architecture.  architecture is an enum returning either
              "x86_64" or "i386"</li>
            </ul>
          </li>
          <li>Changed IPAddress object
            <ul>
              <li> region is now a slug instead of a nested object</li>
            </ul>
          </li>
          <li>Changed Kernel object
            <ul>
              <li> x64 => architecture.  architecture is an enum returning either
              "x86_64" or "i386"</li>
            </ul>
          </li>
          <li>Changed Linode object
            <ul>
              <li> storage => disk</li>
              <li> total_transfer => transfer_total</li>
              <li> distribution is now a slug instead of a nested object</li>
              <li> region is now a slug instead of a nested object</li>
              <li> nested alert objects have been streamlined</li>
              <li>"enabled" and "threshold" have been removed</li>
              <li>a value of 0 now represents "disabled", any other value is "enabled" with
              that threshold</li>
            </ul>
          </li>
          <li>Changed LinodeConfig object
            <ul>
              <li> disable_updatedb => updatedb_disabled</li>
              <li> enable_distro_helper => distro</li>
              <li> enable_modules_dep_helper => modules_dep</li>
              <li> enable_network_helper => network</li>
              <li> ram_limit => memory_limit</li>
              <li> devtmpfs_autocommit moved into "helpers" envelope</li>
            </ul>
          </li>
          <li>Changed Nodebalancer object
            <ul>
              <li> region is now a slug instead of a nested object</li>
            </ul>
          </li>
          <li>Changed Type object
            <ul>
              <li> hourly_price => price_hourly</li>
              <li> monthly_price => price_monthly</li>
              <li> ram => memory</li>
              <li> storage => disk</li>
              <li> mbits_out => network_out</li>
              <li> backups_price is now a nested object containing "price_hourly" and
              "price_monthly"</li>
            </ul>
          </li>
          <li>Changed StackScript object
            <ul>
              <li> Removed "customer_id"</li>
              <li> distributions is now a list of slugs instead of a list of nested objects</li>
              <li> Removed "user_id"</li>
              <li> Added "username"</li>
              <li> Added "user_gravatar_id"</li>
            </ul>
          </li>
          <li>Changed Volume object
            <ul>
              <li> "status" can no longer contain "contact_support" - will return "offline"
              in that case</li>
              <li> region is now a slug instead of a nested object</li>
            </ul>
          </li>
          <li>Changes SupportTicket
            <ul>
              <li> Removed "closed_by"</li>
            </ul>
          </li>
          <li>IP Whitelist may not be enabled in PUT profile if it is already disabled</li>
        </ul>
        <b>Changes:</b><br />
        <ul>
          <li>Default page size increased to 100
            <ul>
              <li>Any page size between 25 and 100 may be requested in the url with ?page_size=</li>
            </ul>
          </li>
          <li>Linode configs now accept deprecated kernels</li>
          <li>Linode configs now default kernel to latest, no longer required on POST</li>
          <li>Added /profile/whitelist
            <ul>
              <li>GET - list all IPs on user's whitelist</li>
              <li>POST - add IP to user's whitelist</li>
              <li>Endpoint return a 400 if IP Whitelist is disabled</li>
            </ul>
          </li>
          <li>Added /profile/whitelist/:id
            <ul>
              <li>GET - return one entry on whitelist</li>
              <li>DELETE - remove address from whitelist</li>
              <li>Endpoints return a 400 if IP Whitelist if disabled</li>
            </ul>
          </li>
          <li>Disk filesystems now default to ext4, no longer required on POST</li>
        </ul>
      </section>
      <div className="text-sm-center">
        <Link to={`/${API_VERSION}/introduction`}>
          Go on to the Introduction
        </Link>
      </div>
    </section>
  );
}
