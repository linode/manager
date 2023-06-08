import { styled } from '@mui/material/styles';
import * as React from 'react';
import { PlaceholderProps } from 'react-select';
import Typography from 'src/components/core/Typography';

interface Props extends PlaceholderProps<any, any> {}

export const SelectPlaceholder = (props: Props) => {
  return (
    <StyledTypography
      {...props.innerProps}
      data-qa-select-placeholder
      data-qa-multi-select={
        props.isMulti ? props.selectProps.placeholder : false
      }
    >
      {props.children}
    </StyledTypography>
  );
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  left: '10px',
  wordWrap: 'normal',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  fontSize: '0.9rem',
  [theme.breakpoints.only('xs')]: {
    fontSize: '1rem',
  },
}));
