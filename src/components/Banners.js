import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';


function filterBanners(banners, filter) {
  return banners.filter(banner => banner.type === filter);
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
        You have an abuse ticket open! <Link
          to={
            `/support/${ticket.id}`
          }
        >[Ticket #{ticket.id}]</Link> {
          banners[0].entity.label
        }
      </div>
    );
  }
}

function renderBanners(banners) {
  const abuseItems = filterBanners(banners, 'abuse_ticket');
  return (
    <div className="Banner">
      {abuseItems.length ?
        abuseTicket(abuseItems) :
        importantTicket(filterBanners(banners, 'important_ticket'))
      }
    </div>
  );
}

export default function Banners(props) {
  const { banners } = props;
  if (!banners.length) {
    return;
  }

  return renderBanners(banners);
}

Banners.propTypes = {
  banners: PropTypes.array,
};
