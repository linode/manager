import { Typography } from '@linode/ui';
import { Button } from 'akamai-cds-react-components';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

interface Props {
  buttonText: string;
  descriptiveText: string;
  disabled?: boolean;
  onClick: () => void;
  sectionTitle: string;
}

const useStyles = makeStyles()((theme: Theme) => ({
  sectionButton: {
    minWidth: 214,
    [theme.breakpoints.down('md')]: {
      alignSelf: 'flex-start',
    },
  },
  sectionText: {
    [theme.breakpoints.down('md')]: {
      marginBottom: '1rem',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    width: '65%',
  },
  sectionTitle: {
    marginBottom: '0.25rem',
  },
  sectionTitleAndText: {
    width: '100%',
  },
  topSection: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
}));

export const DatabaseSettingsMenuItem = (props: Props) => {
  const {
    buttonText,
    descriptiveText,
    disabled = false,
    onClick,
    sectionTitle,
  } = props;

  const { classes } = useStyles();

  return (
    <div className={classes.topSection} data-qa-settings-section={sectionTitle}>
      <div className={classes.sectionTitleAndText}>
        <Typography className={classes.sectionTitle} variant="h3">
          {sectionTitle}
        </Typography>
        <Typography className={classes.sectionText}>
          {descriptiveText}
        </Typography>
      </div>
      <Button
        className={classes.sectionButton}
        data-qa-settings-button={buttonText}
        data-testid={`settings-button-${buttonText}`}
        disabled={disabled}
        onClick={onClick}
        title={buttonText}
        variant="secondary"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default DatabaseSettingsMenuItem;
