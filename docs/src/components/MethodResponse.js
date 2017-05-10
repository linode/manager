import React from 'react';

import { Table, TableRow } from 'linode-components/tables';
import { SchemaTableBody } from './tables';
import { DescriptionCell, ExampleCell, FieldCell } from './tables/Cells';


export default function MethodResponse(props) {
  const { schema } = props;

  return (
    <div className="Method-section Method-response">
      <h4><b>Response</b></h4>
      <Table
        renderRowsFn={function(columns, data, onToggleSelect, selectedMap) {
          const rows = [];
          data.forEach(function (record, index) {
            if (record.example) {
              rows.push((<TableRow
                // assumes that if one record in the collection does not have an id,
                // than no records should have an id, and all keys will fallback to
                // index usage
                key={record.id || index}
                index={index}
                columns={columns}
                record={record}
                onToggleSelect={onToggleSelect}
                selectedMap={selectedMap}
              />));
              rows.push((
                <tr>
                  <ExampleCell example={record.example} colSpan={3} />
                </tr>
              ));
            } else {
              rows.push((<TableRow
                // assumes that if one record in the collection does not have an id,
                // than no records should have an id, and all keys will fallback to
                // index usage
                key={record.id || index}
                index={index}
                columns={columns}
                record={record}
                onToggleSelect={onToggleSelect}
                selectedMap={selectedMap}
              />))
            }
          });

          return rows;
        }}
        className="Table--secondary"
        columns={[
          { cellComponent: FieldCell, label: 'Field', headerClassName: 'FieldColumn' },
          { label: 'Type', dataKey: 'type', headerClassName: 'TypeColumn' },
          { cellComponent: DescriptionCell, label: 'Description', headerClassName: 'DescriptionColumn' }
        ]}
        data={schema}
      />
    </div>
  );
}
