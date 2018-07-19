import * as React from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import {
    StyleRulesCallback,
    Theme,
    WithStyles,
    withStyles,
} from '@material-ui/core/styles';  
import Typography from '@material-ui/core/Typography';

import Notice from 'src/components/Notice';
import CopyableTextField from 'src/features/Volumes/CopyableTextField';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
    root: {
    },
    title: {
      marginBottom: theme.spacing.unit * 2,
    },
  });

interface Props {

}

interface State {
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class EnableTwoFactorForm extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state = {
    errors: undefined,
  }

  componentDidMount () {
    this.mounted = true;
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  render() {
    const { classes, } = this.props;
    const { errors, } = this.state;
    const hasErrorFor = getAPIErrorFor({}, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
      {generalError && <Notice error text={generalError} />}
        <Typography
            variant="body1"
            data-qa-copy
        >
          Scan this QR code to add your Linode account to your TFA app.
        </Typography>
        <Typography
            variant="body1"
            data-qa-copy
        >
          If your TFA app does not have a scanner, you can use this secret key.
        </Typography>
        <CopyableTextField
          className={classes.root}
          editable={false}
          value={"ASDLF435O"}
        />
      </React.Fragment>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(EnableTwoFactorForm);