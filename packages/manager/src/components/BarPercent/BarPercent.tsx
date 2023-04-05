import { styled } from '@mui/material/styles';
import * as React from 'react';
import LinearProgress from 'src/components/core/LinearProgress';

interface Props {
  max: number;
  value: number;
  className?: string;
  valueBuffer?: number;
  isFetchingValue?: boolean;
  rounded?: boolean;
  narrow?: boolean;
}

export const BarPercent = (props: Props) => {
  const { max, value, className, valueBuffer, isFetchingValue } = props;

  const sxDetails = {
    '& .MuiLinearProgress-barColorPrimary': {
      backgroundColor: '#5ad865',
    },
    '& .MuiLinearProgress-bar2Buffer': {
      backgroundColor: '#99ec79',
    },
    '& .MuiLinearProgress-dashed': {
      display: 'none',
    },
  };

  return (
    <StyledDiv className={`${className}`}>
      <StyledLinearProgress
        value={getPercentage(value, max)}
        valueBuffer={valueBuffer}
        variant={
          isFetchingValue
            ? 'indeterminate'
            : valueBuffer
            ? 'buffer'
            : 'determinate'
        }
        sx={sxDetails}
      />
    </StyledDiv>
  );
};

export default React.memo(BarPercent);

export const getPercentage = (value: number, max: number) =>
  (value / max) * 100;

const StyledDiv = styled('div')({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
});

const StyledLinearProgress = styled(LinearProgress, {
  label: 'StyledLinearProgress',
})<Partial<Props>>(({ theme, ...props }) => ({
  backgroundColor: theme.color.grey2,
  padding: 12,
  width: '100%',
  ...(props.rounded && {
    borderRadius: theme.shape.borderRadius,
  }),
  ...(props.narrow && {
    padding: 8,
  }),
}));
