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
