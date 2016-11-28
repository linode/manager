import React, { Component, PropTypes } from 'react';
import { distros } from '~/assets';

export default class Distribution extends Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
    this.state = { open: false, version: 0 };
  }

  onClick() {
    const { vendor, noDistribution } = this.props;
    const { version } = this.state;
    if (noDistribution) {
      this.props.onClick('none');
      return;
    }

    const selectedVersion = vendor.versions[version];
    this.props.onClick(selectedVersion.id);
  }

  renderLabel() {
    const { vendor, noDistribution } = this.props;
    const { version } = this.state;
    if (noDistribution) {
      return 'No distribution';
    }

    const selectedVersion = vendor.versions[version];
    return selectedVersion.label.replace('Arch Linux', 'Arch');
  }

  render() {
    const { onClick, vendor, selected, noDistribution } = this.props;
    const { open } = this.state;

    const isSelected = selected === 'none' && noDistribution ||
                       !noDistribution && vendor.versions.find(v => v.id === selected);

    const isSelectedClass = isSelected ? 'LinodesDistribution--isSelected' : '';
    const noDistributionClass = noDistribution ? 'LinodesDistribution--isNoDistribution' : '';
    const isOpenClass = open ? 'LinodesDistribution-dropdown--isOpen' : '';
    return (
      <div
        onClick={this.onClick}
        className={`LinodesDistribution ${isSelectedClass} ${noDistributionClass}`}
        onBlur={() => this.setState({ open: false })}
      >
        <header
          className={`LinodesDistribution-dropdown ${isOpenClass}`}
        >
          <div className="LinodesDistribution-title">
            {this.renderLabel()}
            {noDistribution ? null : <button
              className="LinodesDistribution-toggleDropdown"
              aria-haspopup
              aria-expanded={open}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.setState({ open: !open });
              }}
            ><i className="fa fa-caret-down"></i></button>}
          </div>
          {vendor ? (
            <div
              className="LinodesDistribution-menu"
            >
              {vendor.versions.map(v =>
                <button
                  key={v.id}
                  className="LinodesDistribution-version"
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick(v.id);
                    this.setState({ open: false, version: vendor.versions.indexOf(v) });
                  }}
                >{v.label}</button>)}
            </div>
          ) : null}
        </header>
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
