import * as React from 'react';

export const useEditableLabelState = () => {
  const [editableLabel, setEditableLabel] = React.useState<string>('');
  const [editableLabelError, setEditableLabelError] = React.useState<string>(
    ''
  );

  const resetEditableLabel = () => {
    setEditableLabelError('');
  };

  return {
    editableLabel,
    setEditableLabel,
    editableLabelError,
    setEditableLabelError,
    resetEditableLabel,
  };
};

export default useEditableLabelState;
