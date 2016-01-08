import React, { Component } from 'react';

export class Linode extends Component {
  render() {
    const { linode } = this.props;
    return (
      <div className="linode">
        {linode.label}
      </div>
    );
  }
}
