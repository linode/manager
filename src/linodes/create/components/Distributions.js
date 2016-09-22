import React, { Component, PropTypes } from 'react';
import { distros } from '~/assets';

export default class Distributions extends Component {
  constructor() {
    super();
    this.state = { open: false, version: 0 };
  }

  render() {
    const { onClick, vendor, selected } = this.props;
    const { open, version } = this.state;
    const label = l => l.replace('Arch Linux', 'Arch'); // bleh
    const selectedVersion = vendor.versions[version];
    return (
      <div
        onClick={() => onClick(selectedVersion.id)}
        className={`distro ${
          vendor.versions.find(v => v.id === selected) ? 'selected' : ''
        }`}
        onBlur={() => this.setState({ open: false })}
      >
        <header className={`dropdown ${open ? 'open' : ''}`}>
          <div className="title">
            {label(selectedVersion.label)}
            <button
              className="dropdown-toggle btn btn-secondary"
              aria-haspopup
              aria-expanded={open}
              id={`distro-dropdown-${selectedVersion.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.setState({ open: !open });
              }}
            ><i className="fa fa-caret-down"></i></button>
          </div>
          <div
            className="dropdown-menu"
            aria-labelledby={`distro-dropdown-${selectedVersion.id}`}
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
              >{v.label}</a>
            )}
          </div>
        </header>
        <div>
          <img
            src={distros[vendor.name]}
            width={64}
            height={64}
            alt={vendor.name}
          />
        </div>
      </div>
    );
  }
}

Distributions.propTypes = {
  vendor: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.string,
};
