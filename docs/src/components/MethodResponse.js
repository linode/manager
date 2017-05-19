import React, { Component, PropTypes } from 'react';

import { Table, TableRow } from 'linode-components/tables';
import Example from './Example';
import { SchemaTableBody } from './tables';
import { DescriptionCell, FieldCell } from './tables/Cells';

const columns = [
  { cellComponent: FieldCell, label: 'Field', headerClassName: 'FieldColumn' },
  { label: 'Type', dataKey: 'type', headerClassName: 'TypeColumn' },
  { cellComponent: DescriptionCell, label: 'Description', headerClassName: 'DescriptionColumn' }
];

export default class MethodResponse extends Component {

  constructor() {
    super();

    this.state = {
      activeSchemaIds: {}
    };
  }

  onClickRow(nestedSchemaId) {
    let { activeSchemaIds }  = this.state;

    if (activeSchemaIds[nestedSchemaId]) {
      delete activeSchemaIds[nestedSchemaId];
    } else {
      activeSchemaIds[nestedSchemaId] = true;
    }

    this.setState({ activeSchemaIds: activeSchemaIds });
  }

  renderNestedSchemaTable(record) {
    return (
      <div>
        <div>{this.renderSchemaTable(record.schema)}</div>
        <div><Example example={JSON.stringify(record.example, null, 2)} /></div>
      </div>
    );
  }

  renderSchemaTable(schemaData) {
    const { activeSchemaIds } = this.state;

    return (
      <Table
        renderRowsFn={(columns, data, onToggleSelect, selectedMap) => {
          const rows = [];
          data.forEach((record, index) => {
            if (record.schema && record.example) {
              const nestedSchemaId = `${record.name}-${index}`;

              rows.push(<TableRow
                className="NestedSchemaParent"
                key={record.id || index}
                index={index}
                columns={columns}
                onClick={() => { this.onClickRow(nestedSchemaId); }}
                record={record}
              />);
              rows.push(
                <tr id={nestedSchemaId} className={`NestedSchemaRow ${!activeSchemaIds[nestedSchemaId] ? 'collapse' : ''}`}>
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
      />
    )
  }

  render() {
    const { schema } = this.props;

    return (
      <div className="Method-section MethodResponse">
        <h4><b>Response</b></h4>
        {this.renderSchemaTable(schema)}
      </div>
    );
  }
}

