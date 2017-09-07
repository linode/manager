import React, { Component, PropTypes } from 'react';

import { Table, TableRow } from 'linode-components/tables';
import { Code } from 'linode-components/formats';

import { DescriptionCell, FieldCell, ParamFieldCell, NestedParentCell } from './tables/cells';


const defaultColumns = [
  { cellComponent: FieldCell, label: 'Field', headerClassName: 'FieldColumn' },
  { label: 'Type', dataKey: 'type', headerClassName: 'TypeColumn' },
  { cellComponent: DescriptionCell, label: 'Description', headerClassName: 'DescriptionColumn' },
];

const enumColumns = [
  { cellComponent: FieldCell, label: 'Value', headerClassName: 'FieldColumn' },
  { cellComponent: DescriptionCell, label: 'Description', headerClassName: 'DescriptionColumn' },
];

export default class Spec extends Component {
  constructor() {
    super();

    this.state = {
      activeSchemaIds: {},
    };
  }

  onClickRow(nestedSchemaId) {
    const { activeSchemaIds } = this.state;

    if (activeSchemaIds[nestedSchemaId]) {
      delete activeSchemaIds[nestedSchemaId];
    } else {
      activeSchemaIds[nestedSchemaId] = true;
    }

    this.setState({ activeSchemaIds: activeSchemaIds });
  }

  renderNestedSchemaTable(record) {
    let example = null;
    if (record.example) {
      example = (
        <div><Code example={JSON.stringify(record.example, null, 2)} /></div>
      );
    }

    const columns = record.type === 'enum' ? enumColumns : defaultColumns;

    return (
      <div>
        <div>{this.renderSchemaTable(record.schema, columns)}</div>
        {example}
      </div>
    );
  }

  renderSchemaTable(schemaData, columns) {
    const { activeSchemaIds } = this.state;

    const type = this.props.request ? 'request parameters' : 'response';
    const noDataMessage = `No ${type} documented.`;

    return (
      <Table
        renderRowsFn={(columns, data) => {
          const rows = [];
          data.forEach((record, index) => {
            if (record.schema) {
              const parentColumns = [
                { ...columns[0], cellComponent: NestedParentCell },
                ...columns.slice(1),
              ];
              const nestedSchemaId = `${record.name}-${index}`;
              rows.push(<TableRow
                className="NestedSchemaParent"
                key={record.id || index}
                index={index}
                columns={parentColumns}
                onClick={() => { this.onClickRow(nestedSchemaId); }}
                record={{ ...record, selected: activeSchemaIds[nestedSchemaId] }}
              />);
              rows.push(
                <tr
                  id={nestedSchemaId}
                  className={
                    `NestedSchemaRow ${!activeSchemaIds[nestedSchemaId] ? 'collapse' : ''}`
                  }
                >
                  <td className="NestedSchemaCell" colSpan={columns.length}>
                    {this.renderNestedSchemaTable(record)}
                  </td>
                </tr>
              );
            } else {
              rows.push(<TableRow
                key={record.id || index}
                index={index}
                columns={columns}
                record={record}
              />);
            }
          });

          return rows;
        }}
        className="Table--secondary"
        columns={columns}
        data={schemaData}
        noDataMessage={noDataMessage}
      />
    );
  }

  render() {
    const { schema, request = false } = this.props;

    const columns = _.cloneDeep(defaultColumns);
    if (request) {
      columns[0] = { cellComponent: ParamFieldCell, label: 'Field', headerClassName: 'FieldColumn' };
    }

    if (!schema) {
      return null;
    }

    return this.renderSchemaTable(schema, defaultColumns);
  }
}

Spec.propTypes = {
  schema: PropTypes.arrayOf(PropTypes.object),
};
