import React from 'react';
import { Link } from 'react-router';

import { Table } from 'linode-components/tables';
import { Code } from 'linode-components/formats';

import { LOGIN_ROOT, API_VERSION } from '~/constants';


export default function Authentication() {
  return (
    <section className="Article">
      <h1>Changelogs</h1>
      <section>
        <p>
        The API V4 is currently in beta, and there will be regular releases that
        may introduce breaking changes.  This is where we will document changes
        in each release.  If you are using the API V4, please check here regularly
        for updates.
        </p>
      </section>
      <section>
        <h2>2017-09-18</h2>
        <hr/><br/>
        <b>Breaking Changes:</b><br/>
        <ul>
          <li>Pagination envelope has changed</li>
            <ul>
              <li> total_pages => pages</li>
              <li> total_results => results</li>
              <li> endpoint-specific key is now always "data"</li>
            </ul>
          <li>Region, Distribution, Type, and Kernel objects are now returned as slugs</li>
            <ul>
              <li> Previously, entire object was returned as part of other responses</li>
            </ul>
          <li>POST linode/instances and POST linode/rebuild automatically issue a boot job</li>
            <ul>
              <li> This behavior can be suppressed by sending "boot": false in the request</li>
            </ul>
          <li>Changed POST linode/instances</li>
            <ul>
              <li> with_backups => backups_enabled</li>
              <li> Now accepts "booted" - defaults to true if distribution is provided</li>
            </ul>
          <li>Changed POST  linode/instances/:id/clone</li>
            <ul>
              <li> with_backups => backups_enabled</li>
            </ul>
          <li>Changed POST linode/instances/:id/rebuild</li>
            <ul>
              <li> Now accepts "booted" - defaults to true</li>
            </ul>
          <li>Changed LinodeNetworkingResponse</li>
            <ul>
              <li> region is now a slug instead of a nested object</li>
            </ul>
          <li>Changed IPv6 object</li>
            <ul>
              <li> region is now a slug instead of a nested object</li>
            </ul>
          <li>Changed Invoice object</li>
            <ul>
              <li> Removed "paid"</li>
              <li> Removed "overdue"</li>
            </ul>
          <li>Changed Region object</li>
            <ul>
              <li> Removed "label"</li>
            </ul>
          <li>Changed Backup object</li>
            <ul>
              <li> regions is now a slug instead of a nested object</li>
            </ul>
          <li>Changed Distribution object</li>
            <ul>
              <li> Removed "created"</li>
              <li> Added "updated"</li>
              <li> minimum_storage_size => disk_minimum</li>
              <li> x64 => architecture.  architecture is an enum returning either "x86_64" or "i386"</li>
            </ul>
          <li>Changed IPAddress object</li>
            <ul>
              <li> region is now a slug instead of a nested object</li>
            </ul>
          <li>Changed Kernel object</li>
            <ul>
              <li> x64 => architecture.  architecture is an enum returning either "x86_64" or "i386"</li>
            </ul>
          <li>Changed Linode object</li>
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
          <li>Changed LinodeConfig object</li>
            <ul>
              <li> disable_updatedb => updatedb_disabled</li>
              <li> enable_distro_helper => distro</li>
              <li> enable_modules_dep_helper => modules_dep</li>
              <li> enable_network_helper => network</li>
              <li> ram_limit => memory_limit</li>
              <li> devtmpfs_autocommit moved into "helpers" envelope</li>
            </ul>
          <li>Changed Nodebalancer object</li>
            <ul>
              <li> region is now a slug instead of a nested object</li>
            </ul>
          <li>Changed Type object</li>
            <ul>
              <li> hourly_price => price_hourly</li>
              <li> monthly_price => price_monthly</li>
              <li> ram => memory</li>
              <li> storage => disk</li>
              <li> mbits_out => network_out</li>
              <li> backups_price is now a nested object containing "price_hourly" and
                  "price_monthly"</li>
            </ul>
          <li>Changed StackScript object</li>
            <ul>
              <li> Removed "customer_id"</li>
              <li> distributions is now a list of slugs instead of a list of nested objects</li>
              <li> Removed "user_id"</li>
              <li> Added "username"</li>
              <li> Added "user_gravatar_id"</li>
            </ul>
          <li>Changed Volume object</li>
            <ul>
              <li> "status" can no longer contain "contact_support" - will return "offline"
                  in that case</li>
              <li> region is now a slug instead of a nested object</li>
            </ul>
          <li>Changes SupportTicket</li>
            <ul>
              <li> Removed "closed_by"</li>
            </ul>
          <li>IP Whitelist may not be enabled in PUT profile if it is already disabled</li>
        </ul>
        <b>Changes:</b><br/>
        <ul>
          <li>Default page size increased to 100</li>
            <ul>
              <li>Any page size between 25 and 100 may be requested in the url with ?page_size=</li>
            </ul>
          <li>Linode configs now accept deprecated kernels</li>
          <li>Linode configs now default kernel to latest, no longer required on POST</li>
          <li>Added /profile/whitelist</li>
            <ul>
              <li>GET - list all IPs on user's whitelist</li>
              <li>POST - add IP to user's whitelist</li>
              <li>Endpoint return a 400 if IP Whitelist is disabled</li>
            </ul>
          <li>Added /profile/whitelist/:id</li>
            <ul>
              <li>GET - return one entry on whitelist</li>
              <li>DELETE - remove address from whitelist</li>
              <li>Endpoints return a 400 if IP Whitelist if disabled</li>
            </ul>
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
