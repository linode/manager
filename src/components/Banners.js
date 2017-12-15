import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';


function filterBanners(banners, filter) {
  return banners.filter(banner => filter.indexOf(banner.type) >= 0);
}

function getLinodeId(linodes, params) {
  let linodeId = null;
  if (params !== {} && linodes !== {}) {
    let linodeObj = null;
    if (linodes.linodes !== {}) {
      linodeObj = Object.values(linodes.linodes).find(linode => {
        if (linode.label === params.linodeLabel) {
          return linode;
        }
      });
    }
    if (linodeObj) {
      linodeId = linodeObj.id;
    }
  }

  return linodeId;
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

function migrations(banners, linodeId) {
  const banner = banners.find(banner => {
    return banner.entity.id === linodeId ? banner : null;
  });

  if (banner) {
    return (
      <div className="migration">
        You have a migration {banner.type.split('_')[0]}!
      </div>
    );
  }
}

function renderBanners(banners, linodeId) {
  const abuseItems = filterBanners(banners, ['abuse_ticket']);

  return (
    <div className="Banner">
      {abuseItems.length ?
        abuseTicket(abuseItems) :
        importantTicket(filterBanners(banners, ['important_ticket']))
      }
      {migrations(filterBanners(banners, ['pending_migration', 'scheduled_migration']), linodeId)}
    </div>
  );
}

export default function Banners(props) {
  const { banners, params, linodes } = props;
  if (!banners.length) {
    return null;
  }
  const linodeId = getLinodeId(linodes, params);

  return renderBanners(banners, linodeId);
}

Banners.propTypes = {
  params: PropTypes.object,
  linodes: PropTypes.object,
  banners: PropTypes.array,
};
