import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { Checkbox } from 'linode-components/forms';

export class PermissionCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: props.title,
    };
  }

  render() {
    const { title } = this.state;
    const { onCellChange, parentKey, columns, objects } = this.props;
    const cols = columns.map(function (col) {
      return {
        cellComponent: CheckboxCell,
        headerClassName: 'CheckboxColumn',
        onChange: onCellChange,
        parentKey,
        dataKey: col.dataKey,
        label: col.label,
      };
    });

    return (
      <div className="form-group Permissions-section">
        <h3>{title} permissions</h3>
        <Table
          className="Table--secondary col-sm-5"
          columns={[
            { dataKey: 'label', label: title },
            ...cols,
          ]}
          data={objects}
        />
      </div>
    );
  }
}

PermissionCard.propTypes = {
  title: PropTypes.string,
  parentKey: PropTypes.string,
  onCellChange: PropTypes.func,
  columns: PropTypes.array,
  objects: PropTypes.array,
};

export function select() {
  return {};
}

export default connect(select)(PermissionCard);
