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

function globalNoticeFilter(banner) {
  const standardBannerTypes = [
    'outage',
    'scheduled_migration',
    'pending_migration',
    'scheduled_reboot',
    'xsa',
    'outstanding_balance',
    'important_ticket',
    'abuse_ticket',
  ];
  /* A global banner has a dynamic type.
     There is only ever one global banner. */
  /* TODO: Request that the API return type "global" with an "entity" containing the message */
  return standardBannerTypes.indexOf(banner.type) === -1;
}

function importantTicket(banners) {
  if (banners.length > 1) {
    return (
      <div className="warning">
        You have <Link to="/support">important tickets</Link> open!
      </div>
    );
  } else if (banners.length === 1) {
    return (
      <div className="warning">
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
  return (
    banners.map((banner, key) =>
      <div className="warning" key={key}>
        You have a host migration {banner.type.split('_')[0]} for this linode!
      </div>
    )
  );
}

function scheduledReboot(banners) {
  return (
    banners.map((banner, key) =>
      <div className="warning" key={key}>
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
    banners.map((banner, key) =>
      <div className="critical" key={key}>
        You have an outstanding balance.
        &nbsp;Please <Link to="/billing/payment">make a payment</Link>
        &nbsp;to avoid service interruption.
      </div>
    )
  );
}

function outage(banners) {
  const datacenterNames = banners.map(banner => banner.entity.id);

  if (datacenterNames.length) {
    return (
      <div className="info">
        We are aware of issues affecting service in the following facilities:
        &nbsp;{datacenterNames.join(', ')}
      </div>
    );
  }
}

function globalNotice(banner) {
  if (banner.length) {
    return (
      <div className="info">
        {banner[0].type}
      </div>
    );
  }
}

function renderBanners(banners, linode = {}) {
  const abuseBanners = filterBy(
    [banner => banner.type === 'abuse_ticket'],
    banners
  );

  const importantTicketBanners = filterBy(
    [banner => banner.type === 'important_ticket'],
    banners
  );

  const outstandingBalanceBanners = filterBy(
    [banner => banner.type === 'outstanding_balance'],
    banners
  );

  const migrationBanners = filterBy(
    [
      banner => ['pending_migration', 'scheduled_migration'].indexOf(banner.type) >= 0,
      banner => banner.entity.id === linode.id,
    ],
    banners
  );

  const scheduledRebootBanners = filterBy(
    [
      banner => banner.type === 'scheduled_reboot',
      banner => banner.entity.id === linode.id,
    ],
    banners
  );

  const xenSecurityAdvisoryBanners = filterBy(
    [
      banner => banner.type === 'xsa',
      banner => banner.entity.id === linode.id,
    ],
    banners
  );

  const outageBanners = filterBy(
    [banner => banner.type === 'outage'],
    banners
  );

  const globalBanners = filterBy(
    [globalNoticeFilter],
    banners
  );

  return (
    <div className="Banner">
      {!isEmpty(abuseBanners) ?
        abuseTicket(abuseBanners) :
        importantTicket(importantTicketBanners)
      }
      {outstandingBalance(outstandingBalanceBanners)}
      {!isEmpty(migrationBanners) && migrations(migrationBanners)}
      {!isEmpty(scheduledRebootBanners) && scheduledReboot(scheduledRebootBanners)}
      {!isEmpty(xenSecurityAdvisoryBanners) && xenSecurityAdvisory(xenSecurityAdvisoryBanners)}
      {!isEmpty(outageBanners) && outage(outageBanners)}
      {!isEmpty(globalBanners) && globalNotice(globalBanners)}
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
