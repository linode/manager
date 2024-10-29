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
  hideIcons?: boolean;
  showDownloadIcon?: boolean;
}

export const CopyableTextField = (props: CopyableTextFieldProps) => {
  const {
    CopyTooltipProps,
    className,
    hideIcons,
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
        endAdornment: hideIcons ? undefined : (
          <StyledIconBox>
            {showDownloadIcon && (
              <DownloadTooltip fileName={fileName} text={`${value}`} />
            )}
            <CopyTooltip text={`${value}`} {...CopyTooltipProps} />
          </StyledIconBox>
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
  '.removeDisabledStyles': {
    '& .MuiInput-input': {
      WebkitTextFillColor: 'unset !important',
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      color:
        theme.name === 'light'
          ? `${theme.palette.text.primary} !important`
          : `${theme.tokens.color.Neutrals.White} !important`,
      opacity: theme.name === 'dark' ? 0.5 : 0.8,
    },
    '&& .MuiInput-root': {
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      opacity: 1,
    },
  },
}));

const StyledIconBox = styled(Box)(({ theme }) => ({
  '& button svg': {
    color: theme.color.grey1,
    height: 14,
    top: 1,
    transition: theme.transitions.create(['color']),
  },
  '& button svg:hover': {
    color: theme.palette.primary.main,
  },
  '&:last-child': {
    marginRight: theme.spacing(0.5),
  },
  display: 'flex',
}));

const snakeCase = (str: string): string => {
  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
};
