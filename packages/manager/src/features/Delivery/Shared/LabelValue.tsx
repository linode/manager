import { Box, Tooltip, Typography } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

const maxWidth = 416;
const labelWidth = 160;
const valueWidth = maxWidth - labelWidth;

interface LabelValueProps {
  'data-testid'?: string;
  label: string;
  value: string;
}
export const LabelValue = (props: LabelValueProps) => {
  const { label, value, 'data-testid': dataTestId } = props;
  const theme = useTheme();
  const labelRef = useRef<HTMLDivElement>(null);
  const [isLabelOverflowing, setIsLabelOverflowing] = useState(false);
  const valueRef = useRef<HTMLDivElement>(null);
  const [isValueOverflowing, setIsValueOverflowing] = useState(false);

  useEffect(() => {
    const checkLabelOverflow = () => {
      if (labelRef.current) {
        setIsLabelOverflowing(
          labelRef.current.scrollWidth > labelRef.current.clientWidth
        );
      }
    };
    const checkValueOverflow = () => {
      if (valueRef.current) {
        setIsValueOverflowing(
          valueRef.current.scrollWidth > valueRef.current.clientWidth
        );
      }
    };
    checkLabelOverflow();
    checkValueOverflow();
  });

  return (
    <Box
      alignItems="center"
      display="flex"
      justifyContent="space-between"
      marginTop={theme.spacingFunction(16)}
      width={maxWidth}
    >
      <StyledLabel title={isLabelOverflowing ? label : undefined}>
        <Box alignItems="center" display="flex" maxWidth={labelWidth}>
          <Typography
            ref={labelRef}
            sx={{
              font: theme.font.bold,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
          <Typography sx={{ font: theme.font.bold, flexShrink: 0 }}>
            :
          </Typography>
        </Box>
      </StyledLabel>
      <Box width={valueWidth}>
        <StyledValue
          data-testid={dataTestId}
          title={isValueOverflowing ? value : undefined}
        >
          <Typography
            ref={valueRef}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: 'fit-content',
            }}
          >
            {value}
          </Typography>
        </StyledValue>
      </Box>
    </Box>
  );
};

const StyledValue = styled(Tooltip, {
  label: 'StyledValue',
})(({ theme }) => ({
  backgroundColor: theme.tokens.alias.Interaction.Background.Disabled,
  border: `1px solid ${theme.tokens.alias.Border.Neutral}`,
  borderRadius: 4,
  height: theme.spacingFunction(24),
  lineHeight: theme.spacingFunction(24),
  maxWidth: valueWidth,
  padding: theme.spacingFunction(1, 8),
}));

const StyledLabel = styled(Tooltip, {
  label: 'StyledLabel',
})(({ theme }) => ({
  height: theme.spacingFunction(24),
  lineHeight: theme.spacingFunction(24),
  maxWidth: labelWidth,
}));
