import { styled } from '@mui/material/styles';
import * as React from 'react';
import { PlaceholderProps } from 'react-select';

import { Typography } from 'src/components/Typography';

type Props = PlaceholderProps<any, any>;

export const SelectPlaceholder = (props: Props) => {
  return (
    <StyledTypography
      {...props.innerProps}
      data-qa-multi-select={
        props.isMulti ? props.selectProps.placeholder : false
      }
      className="select-placeholder"
      data-qa-select-placeholder
    >
      {props.children}
    </StyledTypography>
  );
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  left: '10px',
  overflow: 'hidden',
  position: 'absolute',
  [theme.breakpoints.only('xs')]: {
    fontSize: '1rem',
  },
  whiteSpace: 'nowrap',
  wordWrap: 'normal',
}));
