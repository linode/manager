import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';

interface Props {
  buttonText: string;
  descriptiveText: string;
  sectionTitle: string;
  onClick: () => void;
  disabled?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  topSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  sectionTitleAndText: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  sectionTitle: {
    marginBottom: '0.25rem',
  },
  sectionText: {
    width: '65%',
    marginRight: 0,
    [theme.breakpoints.down('sm')]: {
      marginBottom: '1rem',
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  sectionButton: {
    minWidth: 214,
    [theme.breakpoints.down('sm')]: {
      alignSelf: 'flex-start',
    },
  },
}));

export const DatabaseSettingsMenuItem: React.FC<Props> = (props) => {
  const {
    buttonText,
    descriptiveText,
    sectionTitle,
    onClick,
    disabled = false,
  } = props;

  const classes = useStyles();

  return (
    <div className={classes.topSection}>
      <div className={classes.sectionTitleAndText}>
        <div className={classes.sectionTitle}>
          <Typography variant="h3">{sectionTitle}</Typography>
        </div>
        <div className={classes.sectionText}>
          <Typography>{descriptiveText}</Typography>
        </div>
      </div>
      <Button
        className={classes.sectionButton}
        disabled={disabled}
        buttonType="primary"
        onClick={onClick}
        compact
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default DatabaseSettingsMenuItem;
