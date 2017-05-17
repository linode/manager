import React from 'react';

import { Table, TableRow } from 'linode-components/tables';
import Example from './Example';
import { SchemaTableBody } from './tables';
import { DescriptionCell, FieldCell } from './tables/Cells';

const columns = [
  { cellComponent: FieldCell, label: 'Field', headerClassName: 'FieldColumn' },
  { label: 'Type', dataKey: 'type', headerClassName: 'TypeColumn' },
  { cellComponent: DescriptionCell, label: 'Description', headerClassName: 'DescriptionColumn' }
];

function renderNestedSchemaTable(record) {
  return (
    <div>
      <div>{renderSchemaTable(record.schema)}</div>
      <div><Example example={JSON.stringify(record.example, null, 2)} /></div>
    </div>
  );
}

function renderSchemaTable(schemaData) {
  return (
    <Table
      renderRowsFn={function(columns, data, onToggleSelect, selectedMap) {
        const rows = [];
        data.forEach(function (record, index) {
          if (record.schema && record.example) {
            const nestedSchemaId = `${record.name}-${index}`;

            rows.push(<TableRow
              className="NestedSchemaParent"
              dataTargetId={nestedSchemaId}
              key={record.id || index}
              index={index}
              columns={columns}
              record={record}
            />);
            rows.push(
              <tr id={nestedSchemaId} className="NestedSchemaRow collapse">
                <td className="NestedSchemaCell" colSpan={columns.length}>
                  {renderNestedSchemaTable(record)}
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

export default function MethodResponse(props) {
  const { schema } = props;

  return (
    <div className="Method-section MethodResponse">
      <h4><b>Response</b></h4>
      {renderSchemaTable(schema)}
    </div>
  );
}
