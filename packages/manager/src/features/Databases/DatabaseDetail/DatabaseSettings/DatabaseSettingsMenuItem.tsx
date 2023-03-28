import { Theme } from '@mui/material/styles';
import * as React from 'react';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import { makeStyles } from 'tss-react/mui';

interface Props {
  buttonText: string;
  descriptiveText: string;
  sectionTitle: string;
  onClick: () => void;
  disabled?: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  topSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
  sectionTitleAndText: {
    width: '100%',
  },
  sectionTitle: {
    marginBottom: '0.25rem',
  },
  sectionText: {
    width: '65%',
    [theme.breakpoints.down('md')]: {
      marginBottom: '1rem',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  sectionButton: {
    minWidth: 214,
    [theme.breakpoints.down('md')]: {
      alignSelf: 'flex-start',
    },
  },
}));

export const DatabaseSettingsMenuItem = (props: Props) => {
  const {
    buttonText,
    descriptiveText,
    sectionTitle,
    onClick,
    disabled = false,
  } = props;

  const { classes } = useStyles();

  return (
    <div className={classes.topSection} data-qa-settings-section={sectionTitle}>
      <div className={classes.sectionTitleAndText}>
        <Typography variant="h3" className={classes.sectionTitle}>
          {sectionTitle}
        </Typography>
        <Typography className={classes.sectionText}>
          {descriptiveText}
        </Typography>
      </div>
      <Button
        data-qa-settings-button={buttonText}
        className={classes.sectionButton}
        disabled={disabled}
        buttonType="primary"
        onClick={onClick}
        compactX
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default DatabaseSettingsMenuItem;
