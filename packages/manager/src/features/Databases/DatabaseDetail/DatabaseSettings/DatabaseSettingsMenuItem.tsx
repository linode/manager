import * as React from 'react';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

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
    width: '100%',
  },
  sectionTitle: {
    marginBottom: '0.25rem',
  },
  sectionText: {
    width: '65%',
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
