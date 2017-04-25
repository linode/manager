import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { CheckboxCell } from 'linode-components/tables/cells';
import { Table } from 'linode-components/tables';

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
        onChange: onCellChange,
        parentKey,
        dataKey: col.dataKey,
        label: col.label,
      };
    });

    return (
      <Card
        header={
          <CardHeader
            title={`${title} permissions`}
          />
        }
      >
        <Table
          className="Table--secondary col-sm-8"
          columns={[
            { dataKey: 'label', label: title },
            ...cols,
          ]}
          data={objects}
        />
      </Card>
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
