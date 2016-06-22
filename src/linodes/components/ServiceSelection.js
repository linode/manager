import React, { Component } from 'react';

export default class ServiceSelection extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
  }

  renderHeader() {
    return (
      <header>
        <h2>Select a plan</h2>
      </header>
    );
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        <div className="card-body">
          TODO
        </div>
      </div>
    );
  }
}
