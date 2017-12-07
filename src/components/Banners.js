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
        You have <Link to={banners[0].entity.url}>important tickets</Link> open!
      </div>
    );
  }
}

function renderBanners(banners) {
  return importantTicket(filterBanners(banners, 'important_ticket'));
}

export default function Banners(props) {
  const { banners } = props;
  if (!banners.length) {
    return;
  }

  return (
    <div className="Banner">
      {renderBanners(banners)}
    </div>
  );
}

Banners.propTypes = {
  banners: PropTypes.array,
};
