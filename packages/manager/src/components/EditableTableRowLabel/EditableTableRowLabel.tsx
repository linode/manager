import * as React from 'react';
import EditableText from 'src/components/EditableText';
import TableCell from 'src/components/TableCell';

interface Props {
  text?: string;
  width?: string;
}

export const EditableTableRowLabel: React.FC<Props> = props => {
  const { width } = props;
  return (
    <TableCell style={{ width: width || '20%' }}>
      <EditableText
        onEdit={() => Promise.resolve()}
        onCancel={() => Promise.resolve()}
        text="some text"
        variant="standard"
        typeVariant="any"
      />
    </TableCell>
  );
};

export default EditableTableRowLabel;
