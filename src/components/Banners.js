import PropTypes from 'prop-types';
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';

import api from '~/api';
import { BANNER_TYPES } from '~/constants';
import { ComponentPreload as Preload } from '~/decorators/Preload';

const {
  OUTAGE,
  MIGRATION_SCHEDULED,
  MIGRATION_PENDING,
  REBOOT_SCHEDULED,
  XSA,
  BALANCE_OUTSTANDING,
  TICKET_IMPORTANT,
  TICKET_ABUSE,
  LINODE,
} = BANNER_TYPES;

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
    return (
      <div className="critical">
        You have an <Link to={`/support/${banners[0].entity.id}`}>abuse ticket</Link> open!
      </div>
    );
  }
}

function migrations(banners, nameEntities) {
  return banners.map((banner, key) => {
    const entityName = nameEntities ? banner.entity.label : 'this Linode';
    return (
      <div className="warning" key={key}>
        You have a host migration {banner.type.split('_')[1]} for {entityName}!
      </div>
    );
  });
}

function scheduledReboot(banners, nameEntities) {
  return banners.map((banner, key) => {
    const entityName = nameEntities ? banner.entity.label : 'This Linode';
    return (
      <div className="warning" key={key}>
        {entityName} is scheduled to reboot.
      </div>
    );
  });
}

function xenSecurityAdvisory(banners, nameEntities) {
  return banners.map((banner, key) => {
    const entityName = nameEntities ? banner.entity.label : 'This Linode';
    const timestamp = banner.when.replace('T', ' ');
    return (
      <div className="critical" key={key} >
        {entityName} is scheduled for an XSA restart at {timestamp}.
      </div>
    );
  });
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
        {banner[0].message}
      </div>
    );
  }
}

function renderBanners(banners, linode = {}, nameEntities) {
  const abuseBanners = filterBy(
    [banner => banner.type === TICKET_ABUSE],
    banners
  );

  const importantTicketBanners = filterBy(
    [banner => banner.type === TICKET_IMPORTANT],
    banners
  );

  const outstandingBalanceBanners = filterBy(
    [banner => banner.type === BALANCE_OUTSTANDING],
    banners
  );

  const migrationBanners = filterBy(
    [
      banner => [MIGRATION_PENDING, MIGRATION_SCHEDULED].indexOf(banner.type) >= 0,
      banner => nameEntities || (banner.entity.id === linode.id),
    ],
    banners
  );

  const scheduledRebootBanners = filterBy(
    [
      banner => banner.type === REBOOT_SCHEDULED,
      banner => nameEntities || (banner.entity.id === linode.id),
    ],
    banners
  );

  const xenSecurityAdvisoryBanners = filterBy(
    [
      banner => banner.type === XSA,
      banner => nameEntities || (banner.entity.id === linode.id),
    ],
    banners
  );

  const outageBanners = filterBy(
    [banner => banner.type === OUTAGE],
    banners
  );

  const globalBanners = filterBy(
    [banner => banner.type === LINODE],
    banners
  );

  return (
    <div className="Banner">
      {!isEmpty(abuseBanners) ?
        abuseTicket(abuseBanners) :
        importantTicket(importantTicketBanners)
      }
      {outstandingBalance(outstandingBalanceBanners)}
      {!isEmpty(migrationBanners) && migrations(
        migrationBanners, nameEntities)}
      {!isEmpty(scheduledRebootBanners) && scheduledReboot(
        scheduledRebootBanners, nameEntities)}
      {!isEmpty(xenSecurityAdvisoryBanners) && xenSecurityAdvisory(
        xenSecurityAdvisoryBanners, nameEntities)}
      {!isEmpty(outageBanners) && outage(outageBanners)}
      {!isEmpty(globalBanners) && globalNotice(globalBanners)}
    </div>
  );
}

export function Banners(props) {
  const { banners, linode, nameEntities } = props;
  return banners.length ? renderBanners(banners, linode, nameEntities) : null;
}

Banners.propTypes = {
  linode: PropTypes.object,
  banners: PropTypes.array,
  nameEntities: PropTypes.bool,
};

Banners.defaultProps = {
  banners: [],
};

const getLinodeIdFromStateByLabel = (state, label) => Object
  .values(state.api.linodes.linodes)
  .find((linode) => linode.label === label);

const mapStateToProps = (state, ownProps) => {
  const match = matchPath(ownProps.location.pathname, {
    path: '/linodes/:linodeLabel',
  });
  const linodeLabel = (match && match.params.linodeLabel) || {};
  return {
    linode: linodeLabel && getLinodeIdFromStateByLabel(state, linodeLabel),
    banners: state.api.banners.data,
  };
};

const preloadRequest = async (dispatch) => {
  await dispatch(api.banners.one());
};

const ConnectedBanners = compose(
  connect(mapStateToProps),
  Preload(preloadRequest),
)(Banners);

ConnectedBanners.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      linodeLabel: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default ConnectedBanners;
