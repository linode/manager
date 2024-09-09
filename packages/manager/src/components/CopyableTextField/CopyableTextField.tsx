import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TextField } from 'src/components/TextField';

import { DownloadTooltip } from '../DownloadTooltip';

import type { CopyTooltipProps } from 'src/components/CopyTooltip/CopyTooltip';
import type { TextFieldProps } from 'src/components/TextField';

interface CopyableTextFieldProps extends TextFieldProps {
  /**
   * Optional props that are passed to the underlying CopyTooltip component
   */
  CopyTooltipProps?: Partial<CopyTooltipProps>;
  className?: string;
  hideIcon?: boolean;
  showDownloadIcon?: boolean;
}

export const CopyableTextField = (props: CopyableTextFieldProps) => {
  const {
    CopyTooltipProps,
    className,
    hideIcon,
    showDownloadIcon,
    value,
    ...restProps
  } = props;

  const fileName = showDownloadIcon ? snakeCase(props.label) : '';

  return (
    <StyledTextField
      value={value}
      {...restProps}
      InputProps={{
        endAdornment: hideIcon ? undefined : (
          <Box display="flex">
            {props.showDownloadIcon && (
              <DownloadTooltip
                className="icon"
                fileName={fileName}
                text={`${value}`}
              />
            )}
            <CopyTooltip
              className="icon"
              text={`${value}`}
              {...CopyTooltipProps}
            />
          </Box>
        ),
      }}
      className={`${className} copy removeDisabledStyles`}
      data-qa-copy-tooltip
      disabled
    />
  );
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  '&.copy > div': {
    backgroundColor: theme.name === 'dark' ? '#2f3236' : '#f4f4f4',
    opacity: 1,
  },
  '.icon': {
    '& :hover': {
      color: 'inherit',
    },
    '& svg': {
      color: 'inherit',
      height: 14,
      top: 1,
    },
  },
  '.removeDisabledStyles': {
    '& .MuiInput-input': {
      WebkitTextFillColor: 'unset !important',
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      color:
        theme.name === 'light'
          ? `${theme.palette.text.primary} !important`
          : '#fff !important',
      opacity: theme.name === 'dark' ? 0.5 : 0.8,
    },
    '&& .MuiInput-root': {
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      opacity: 1,
    },
  },
}));

const snakeCase = (str: string): string => {
  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
};
