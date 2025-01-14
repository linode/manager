import ClearOutlineOutlined from '@mui/icons-material/ClearOutlined';
import { IconButton } from '@mui/material';
import * as React from 'react';
interface ClearIconButtonProps {
  /**
   * method passed from the parent component to control the onClick function
   * @returns void
   */
  handleClick: () => void;
}
export const ClearIconButton = (props: ClearIconButtonProps) => {
  const { handleClick } = props;
  return (
    <IconButton
      sx={{
        padding: 0,
      }}
      data-testid="clear-icon"
      onClick={handleClick}
    >
      <ClearOutlineOutlined />
    </IconButton>
  );
};
