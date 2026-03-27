import { Box, Tooltip, Typography } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

const maxWidth = 416;
const labelWidth = 160;
const valueWidth = maxWidth - labelWidth;

interface LabelValueProps {
  copyable?: boolean;
  'data-testid'?: string;
  disableValueTooltip?: boolean;
  label: string;
  value: string;
}

export const LabelValue = (props: LabelValueProps) => {
  const {
    copyable,
    'data-testid': dataTestId,
    disableValueTooltip,
    label,
    value,
  } = props;
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
      alignItems="flex-end"
      display="flex"
      justifyContent="flex-start"
      minWidth={0}
    >
      <Box
        alignItems="center"
        display="flex"
        marginTop={theme.spacingFunction(16)}
        maxWidth={maxWidth}
        minWidth={0}
        width="100%"
      >
        <Tooltip title={isLabelOverflowing ? label : undefined}>
          <Box
            sx={{
              flex: `0 1 ${labelWidth}px`,
              height: theme.spacingFunction(24),
              lineHeight: theme.spacingFunction(24),
              minWidth: 0,
            }}
          >
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
                :&nbsp;
              </Typography>
            </Box>
          </Box>
        </Tooltip>
        <Box
          data-testid={dataTestId}
          sx={{ flex: `0 1 ${valueWidth}px`, minWidth: 0 }}
        >
          <Tooltip
            title={
              !disableValueTooltip && isValueOverflowing ? value : undefined
            }
          >
            <Typography
              ref={valueRef}
              sx={{
                backgroundColor:
                  theme.tokens.alias.Interaction.Background.Disabled,
                border: `1px solid ${theme.tokens.alias.Border.Neutral}`,
                borderRadius: 1,
                boxSizing: 'border-box',
                height: theme.spacingFunction(24),
                lineHeight: theme.spacingFunction(24),
                maxWidth: '100%',
                overflow: 'hidden',
                padding: theme.spacingFunction(1, 8),
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: 'fit-content',
              }}
            >
              {value}
            </Typography>
          </Tooltip>
        </Box>
      </Box>
      {copyable && <StyledCopyTooltip text={value} />}
    </Box>
  );
};

const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(({ theme }) => ({
  '& svg': {
    height: theme.spacingFunction(16),
    width: theme.spacingFunction(16),
  },
  '&:hover': {
    backgroundColor: 'transparent',
  },
  display: 'inline-flex',
  marginLeft: theme.spacingFunction(12),
}));
