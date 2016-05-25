import React, { Component } from 'react';
import { distros } from '~/assets';
import _ from 'underscore';

export default class DistroSelection extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderDistro = this.renderDistro.bind(this);
  }

  renderDistro(distro) {
    const { onSelection, selected } = this.props;
    return (
      <div className={`distro ${selected == distro.id ? 'selected' : ''}`}
        key={distro.id} onClick={() => onSelection(distro.id)}
      >
        <img src={distros[distro.vendor]
          ? distros[distro.vendor] : '//placehold.it/50x50'}
          width="50" height="50" alt={distro.vendor}
        />
        {distro.label}
      </div>
    );
  }

  render() {
    const { distros } = this.props;
    return (
      <div className="creation-step">
        <input className="form-control"
          placeholder="Search images..."
        />
        <div className="list">
          <h3>Recommended Images</h3>
          {_.sortBy(Object.values(distros)
            .filter(d => d.recommended), 'label')
            .map(this.renderDistro)}
          <h3>Legacy Images</h3>
          {_.sortBy(Object.values(distros)
            .filter(d => !d.recommended), 'label')
            .map(this.renderDistro)}
        </div>
      </div>
    );
  }
}
