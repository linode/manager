import * as React from 'react';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  updateButton: {
    marginLeft: 16
  }
}));

interface Props {
  email: string;
  onConfirm: () => void;
  onRequestChange: () => void;
  loading: boolean;
}

type CombinedProps = Props;

const EmailBounceNotification: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return (
    // <DismissibleBanner onClick={handleClick}>
    <Notice
      important
      error
      spacing={2}
      text={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography>
            We tried sending you an email but it couldn&apos;t be delivered. Is{' '}
            {props.email} the correct address?
          </Typography>
          <span>
            <Button
              buttonType="secondary"
              onClick={props.onConfirm}
              loading={props.loading}
            >
              Yes, it&apos;s correct.
            </Button>
            <Button
              className={classes.updateButton}
              buttonType="primary"
              onClick={props.onRequestChange}
            >
              No, let&apos;s update it
            </Button>
          </span>
        </Box>
      }
    />
    // </DismissibleBanner>
  );
};

export default EmailBounceNotification;
