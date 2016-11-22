import React, { Component, PropTypes } from 'react';
import { distros } from '~/assets';

export default class Distributions extends Component {
  constructor() {
    super();
    this.state = { open: false, version: 0 };
  }

  render() {
    const { onClick, vendor, selected, noDistribution } = this.props;
    const { open, version } = this.state;

    const label = () => {
      if (noDistribution) {
        return 'No distribution';
      }

      const selectedVersion = vendor.versions[version];
      return selectedVersion.label.replace('Arch Linux', 'Arch');
    };

    const handleOnClick = () => {
      if (noDistribution) {
        onClick('none');
        return;
      }

      const selectedVersion = vendor.versions[version];
      onClick(selectedVersion.id);
    };

    const isSelected = selected === 'none' && noDistribution ||
                       !noDistribution && vendor.versions.find(v => v.id === selected);

    const isSelectedClass = isSelected ? 'selected' : '';
    const noDistributionClass = noDistribution ? 'noDistribution' : '';
    return (
      <div
        onClick={handleOnClick}
        className={`distro ${isSelectedClass} ${noDistributionClass}`}
        onBlur={() => this.setState({ open: false })}
      >
        <header className={`dropdown ${open ? 'open' : ''}`}>
          <div className="title">
            {label()}
            {noDistribution ? null : <button
              className="dropdown-toggle btn btn-secondary"
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
              className="dropdown-menu"
            >
              {vendor.versions.map(v =>
                <a
                  key={v.id}
                  className="dropdown-item"
                  href="#"
                  onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick(v.id);
                    this.setState({ open: false, version: vendor.versions.indexOf(v) });
                  }}
                >{v.label}</a>)}
            </div>
          ) : null}
        </header>
        <div>
          {vendor ? <img
            src={distros[vendor.name]}
            width={64}
            height={64}
            alt={vendor.name}
          /> : <span>Customize your configs and disks manually after creation.</span>}
        </div>
      </div>
    );
  }
}

Distributions.propTypes = {
  vendor: PropTypes.object,
  onClick: PropTypes.func,
  selected: PropTypes.string,
  noDistribution: PropTypes.bool,
};
