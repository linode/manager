import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import snakeCase from 'lodash/snakeCase';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DownloadTooltip } from 'src/components/DownloadTooltip';
import { TextField, TextFieldProps } from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  copyIcon: {
    '& svg': {
      height: 14,
      top: 1,
    },
    marginRight: theme.spacing(0.5),
  },
  removeDisabledStyles: {
    '&.Mui-disabled': {
      background: theme.bg.main,
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      color: theme.name === 'light' ? 'inherit' : '#fff !important',
      opacity: 1,
    },
  },
}));

type Props = TextFieldProps & {
  className?: string;
  fileName?: string;
  hideIcon?: boolean;
};

export const CopyableAndDownloadableTextField = (props: Props) => {
  const classes = useStyles();
  const { className, hideIcon, value, ...restProps } = props;

  const fileName = props.fileName ?? snakeCase(props.label);

  return (
    <TextField
      value={value}
      {...restProps}
      InputProps={{
        endAdornment: hideIcon ? undefined : (
          <>
            <DownloadTooltip
              className={classes.copyIcon}
              fileName={fileName}
              text={`${value}`}
            />
            <CopyTooltip className={classes.copyIcon} text={`${value}`} />
          </>
        ),
      }}
      className={`${className} ${classes.removeDisabledStyles}`}
      data-qa-copy-tooltip
      disabled
    />
  );
};
