import React, { PropTypes } from 'react';
import _ from 'lodash';

import Distribution from './Distribution';

export default function Distributions(props) {
  const { distributions, distribution, onSelected, noDistribution = true } = props;

  if (!Object.values(distributions).length) {
    return null;
  }

  const withVendorLowerCased = _.map(distributions, d => ({
    ...d,
    vendor: d.vendor.toLowerCase(),
  }));

  const vendorsUnsorted = _.map(
    _.groupBy(withVendorLowerCased, 'vendor'),
    (v, k) => ({
      name: k,
      versions: _.orderBy(v, ['recommended', 'created'], ['desc', 'desc']),
    })
  );

  const vendorByName = name =>
    vendorsUnsorted.find(v => v.name.toLowerCase().indexOf(name) !== -1);

  const vendorNames = [
    'ubuntu', 'debian', 'centos', 'fedora', 'arch', 'opensuse', 'gentoo',
    'slackware',
  ];

  const vendors = [];

  for (const vendorName of vendorNames) {
    const byName = vendorByName(vendorName);

    if (byName) {
      vendors.push(byName);
    }
  }

  const chunkedDistros = _.chunk(vendors, 4);

  return (
    <div>
      {chunkedDistros.map((arr, index) => {
        return (
          <div key={index} className="row">
            {arr.map((distro, index) => {
              return (
                <div key={index} className="col-sm-3">
                  <Distribution
                    selected={distribution}
                    vendor={distro}
                    onClick={onSelected}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
      {!noDistribution ? null : (
        <div className="row">
          <div className="col-sm-3">
            <Distribution
              noDistribution
              selected={distribution}
              onClick={onSelected}
            />
          </div>
        </div>)}
    </div>
  );
}

Distributions.propTypes = {
  distributions: PropTypes.object.isRequired,
  distribution: PropTypes.string,
  onSelected: PropTypes.func.isRequired,
  noDistribution: PropTypes.bool,
};
