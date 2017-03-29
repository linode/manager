import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card } from '~/components/cards';
import { Checkbox } from '~/components/form';

export class PermissionCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: props.title,
    };
  }

  render() {
    const { section, updateGlobal } = this.props;
    return (
      <Card
        title={this.state.title}
      >
        <Checkbox
          id={`permission-global-${section}`}
          checked={this.props.addCheck}
          onChange={() => updateGlobal(`add_${section}`)}
          label={this.props.addLabel}
        />
      </Card>
    );
  }
}

PermissionCard.propTypes = {
  updateGlobal: PropTypes.func,
  title: PropTypes.string,
  section: PropTypes.string,
  addLabel: PropTypes.string,
  addCheck: PropTypes.bool,
};

export function select() {
  return {};
}

export default connect(select)(PermissionCard);
