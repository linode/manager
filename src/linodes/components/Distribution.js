import React, { Component, PropTypes } from 'react';

import { Dropdown } from 'linode-components/dropdowns';

import { distros } from '~/assets';
import { EmitEvent } from 'linode-components/utils';


export default class Distribution extends Component {
  constructor(props) {
    super(props);

    // In the case of no distribution
    const vendor = props.vendor || { versions: [] };

    // If this distribution is not selected, default to first version.
    const selectedIndex = Math.max(0, Object.values(vendor.versions).map(
      ({ id }) => id).indexOf(props.selected));
    this.state = { selectedIndex };
  }

  onClick = () => {
    const { vendor, noDistribution } = this.props;
    const { selectedIndex } = this.state;
    if (noDistribution) {
      this.props.onClick('none');
      return;
    }

    const selectedVersion = vendor.versions[selectedIndex];
    this.props.onClick(selectedVersion.id);
  }

  renderLabel() {
    const { vendor, noDistribution } = this.props;
    const { selectedIndex } = this.state;
    if (noDistribution) {
      return 'Empty';
    }

    const selectedVersion = vendor.versions[selectedIndex];
    return selectedVersion.label.replace('Arch Linux', 'Arch');
  }

  render() {
    const { vendor, selected, noDistribution } = this.props;

    const isSelected = selected === 'none' && noDistribution ||
                       !noDistribution && vendor.versions.find(v => v.id === selected);

    const isSelectedClass = isSelected ? 'LinodesDistribution--isSelected' : '';
    const noDistributionClass = noDistribution ? 'LinodesDistribution--isNoDistribution' : '';

    const versions = !vendor ? [{ name: 'Empty' }] : [
      {
        name: this.renderLabel(),
        action: this.onClick,
      },
      ...vendor.versions.map((version, i) => ({
        name: version.label,
        action: () => {
          this.setState({ selectedIndex: i }, this.onClick);
          EmitEvent('dropdown:click', 'Dropdown', 'select distro version', version.label);
        },
      })),
    ];

    return (
      <div
        onClick={this.onClick}
        className={`LinodesDistribution ${isSelectedClass} ${noDistributionClass}`}
      >
        <Dropdown
          elements={versions}
          onOpen={() => EmitEvent('dropdown:open', 'Dropdown', 'open distro version', vendor.name)}
          onClose={() => EmitEvent(
            'dropdown:close',
            'Dropdown',
            'close distro version',
            vendor.name
          )}
        />
        <div className="LinodesDistribution-body">
          {vendor ? <img
            src={distros[vendor.name]}
            width={64}
            height={64}
            className="LinodesDistribution-image"
            alt={vendor.name}
          /> : <span>Customize your configs and disks manually after creation.</span>}
        </div>
      </div>
    );
  }
}

Distribution.propTypes = {
  vendor: PropTypes.object,
  onClick: PropTypes.func,
  selected: PropTypes.string,
  noDistribution: PropTypes.bool,
};
