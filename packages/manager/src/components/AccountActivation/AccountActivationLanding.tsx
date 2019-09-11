import Warning from '@material-ui/icons/CheckCircle';
import * as React from 'react';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import SupportLink from 'src/components/SupportLink';

const useStyles = makeStyles((theme: Theme) => ({
  errorHeading: {
    marginBottom: theme.spacing(2)
  }
}));

type CombinedProps = WithTheme;

const AccountActivationLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return (
    <ErrorState
      CustomIcon={Warning}
      CustomIconStyles={{
        color: props.theme.color.blue
      }}
      errorText={
        <React.Fragment>
          <Typography variant="h2" className={classes.errorHeading}>
            Thank you for completing your signup!
          </Typography>
          <Typography>
            Your account is currently being reviewed. You'll recieve an email
            from us once our review is complete, so hang tight! If you have
            questions during this process{' '}
            <SupportLink
              title="Help me activate my account"
              text="please open a Support ticket."
            />
          </Typography>
        </React.Fragment>
      }
    />
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withTheme
)(AccountActivationLanding);
