import { Box, TextField } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import { DownloadTooltip } from '../DownloadTooltip';

import type { TextFieldProps } from '@linode/ui';
import type { CopyTooltipProps } from 'src/components/CopyTooltip/CopyTooltip';

export interface CopyableTextFieldProps extends TextFieldProps {
  className?: string;
  /**
   * Optional props that are passed to the underlying CopyTooltip component
   */
  CopyTooltipProps?: Partial<CopyTooltipProps>;
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
      className={`${className} copy removeDisabledStyles`}
      data-qa-copy-tooltip
      disabled
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
    />
  );
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  '&.copy > div': {
    opacity: 1,
  },
  '.removeDisabledStyles': {
    '& .MuiInput-input': {
      WebkitTextFillColor: 'unset !important',
      borderColor:
        theme.name === 'light'
          ? theme.tokens.color.Neutrals[40]
          : theme.tokens.color.Neutrals.Black,
      color:
        theme.name === 'light'
          ? `${theme.palette.text.primary} !important`
          : `${theme.tokens.color.Neutrals.White} !important`,
      opacity: theme.name === 'dark' ? 0.5 : 0.8,
    },
    '&& .MuiInput-root': {
      borderColor:
        theme.name === 'light'
          ? theme.tokens.color.Neutrals[40]
          : theme.tokens.color.Neutrals.Black,
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
