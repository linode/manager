import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';


function filterBanners(banners, filter) {
  return banners.filter(banner => filter.indexOf(banner.type) >= 0);
}

function importantTicket(banners) {
  if (banners.length > 1) {
    return (
      <div className="importantTicket">
        You have <Link to="/support">important tickets</Link> open!
      </div>
    );
  } else if (banners.length === 1) {
    return (
      <div className="importantTicket">
        You have an <Link to={`/support/${banners[0].entity.id}`}>important ticket</Link> open!
      </div>
    );
  }
}

function abuseTicket(banners) {
  if (banners.length > 1) {
    return (
      <div className="abuseTicket">
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

function migrations(banners, linode) {
  const banner = banners.find(banner => banner.entity.id === linode.id);

  if (banner) {
    return (
      <div className="migration">
        You have a host migration {banner.type.split('_')[0]} for this linode!
      </div>
    );
  }
}

function renderBanners(banners, linode) {
  const abuseItems = filterBanners(banners, ['abuse_ticket']);

  return (
    <div className="Banner">
      {abuseItems.length ?
        abuseTicket(abuseItems) :
        importantTicket(filterBanners(banners, ['important_ticket']))
      }
      {migrations(filterBanners(banners, ['pending_migration', 'scheduled_migration']), linode)}
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
