import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import isEmpty from 'lodash/isEmpty';

/**
 * @param {[function]} pred Array of functions whos only arguement is the
 * data provided and must return a boolean.
 * @param {[*]} data The data to be filtered.
 */
export function filterBy(pred, data) {
  if (!Array.isArray(pred)) {
    throw TypeError('\'pred\' must be an array of functions.');
  }
  if (!Array.isArray(data)) {
    throw TypeError('\'data\' must be an array.');
  }

  return data.filter((value) =>
    pred.reduce((result, fn) =>
      result ? fn(value) : result, true));
}

function importantTicket(banners) {
  if (banners.length > 1) {
    return (
      <div className="notice">
        You have <Link to="/support">important tickets</Link> open!
      </div>
    );
  } else if (banners.length === 1) {
    return (
      <div className="notice">
        You have an <Link to={`/support/${banners[0].entity.id}`}>important ticket</Link> open!
      </div>
    );
  }
}

function abuseTicket(banners) {
  if (banners.length > 1) {
    return (
      <div className="critical">
        You have <Link to="/support">abuse tickets</Link> open!
      </div>
    );
  } else if (banners.length === 1) {
    const ticket = banners[0].entity;
    return (
      <div className="abuseTicket">
        You have an abuse ticket open!
        &nbsp;<Link to={`/support/${ticket.id}`}>[Ticket #{ticket.id}]</Link>
        &nbsp;banners[0].entity.label
      </div>
    );
  }
}

function migrations(banners) {
  banners.map((banner, key) => {
    return (
      <div className="notice" key={key}>
        You have a host migration {banner.type.split('_')[0]} for this linode!
      </div>
    );
  });
}

function scheduledReboot(banners) {
  return (
    banners.map((banner, key) =>
      <div className="notice" key={key}>
        {banner.entity.label} is scheduled to reboot.
      </div>
    )
  );
}

function xenSecurityAdvisory(banners) {
  return (
    banners.map((banner, key) =>
      <div className="critical" key={key} >
        {banner.entity.label} is scheduled for an XSA restart {banner.when}.
      </div>
    )
  );
}

function outstandingBalance(banners) {
  return (
    /* eslint-disable max-len */
    banners.map((banner, key) =>
      <div className="critical" key={key}>
        You have an outstanding balance. Please <Link to="/billing/payment">make a payment</Link> to avoid service interruption.
      </div>
      /* eslint-enable max-len */
    )
  );
}

function renderBanners(banners, linode = {}) {
  const abuseBanners = filterBy(
    [(banner) => banner.type === 'abuse_ticket'],
    banners
  );

  const importantTicketBanners = filterBy(
    [(banner) => banner.type === 'important_ticket'],
    banners
  );

  const outstandingBalanceBanners = filterBy(
    [(banner) => banner.type === 'outstanding_balance'],
    banners
  );

  const migrationBanners = filterBy(
    [banner => ['pending_migration', 'scheduled_migration'].indexOf(banner.type) >= 0],
    banners
  );

  const scheduledRebootBanners = filterBy(
    [
      (banner) => banner.type === 'scheduled_reboot',
      (banner) => banner.entity.id === linode.id,
    ],
    banners
  );

  const xenSecurityAdvisoryBanners = filterBy(
    [
      (banner) => banner.type === 'xsa',
      (banner) => banner.entity.id === linode.id,
    ],
    banners
  );

  return (
    <div className="Banner">
      {abuseBanners.length ?
        abuseTicket(abuseBanners) :
        importantTicket(importantTicketBanners)
      }
      {outstandingBalance(outstandingBalanceBanners)}
      {!isEmpty(migrationBanners) && migrations(migrationBanners)}
      {!isEmpty(scheduledRebootBanners) && scheduledReboot(scheduledRebootBanners)}
      {!isEmpty(xenSecurityAdvisoryBanners) && xenSecurityAdvisory(xenSecurityAdvisoryBanners)}
    </div>
  );
}

export default function Banners(props) {
  const { banners, linode } = props;
  return banners.length ? renderBanners(banners, linode) : null;
}

Banners.propTypes = {
  linode: PropTypes.object,
  banners: PropTypes.array,
};
