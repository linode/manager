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
            if (record.schema && record.example) {
              rows.push((<TableRow
                key={record.id || index}
                index={index}
                columns={columns}
                record={record}
              />));
              // TODO: Nested rows:
              {/*record.schema.forEach(function(nestedRecord, index) {*/}
                {/*rows.push((<TableRow*/}
                  {/*key={nestedRecord.id || index}*/}
                  {/*index={index}*/}
                  {/*columns={columns}*/}
                  {/*record={nestedRecord}*/}
                {/*/>));*/}
              {/*});*/}
              {/*rows.push((*/}
                {/*<tr>*/}
                  {/*<ExampleCell example={record.example} colSpan={3} />*/}
                {/*</tr>*/}
              {/*));*/}
            } else {
              rows.push((<TableRow
                key={record.id || index}
                index={index}
                columns={columns}
                record={record}
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
