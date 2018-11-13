import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';

import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';
import TagsInput, { TagInputProps } from 'src/components/TagsInput';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';


type ClassNames = 'root'
  | 'inner'
  | 'expPanelButton';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  expPanelButton: {
    padding: 0,
    marginTop: theme.spacing.unit * 2,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  error?: string;
  labelFieldProps?: TextFieldProps;
  tagsInputProps?: TagInputProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class InfoPanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
    labelFieldProps: {
      label: 'Label',
      placeholder: 'Enter a Label',
    },
  };

  render() {
    const { classes, error, labelFieldProps, tagsInputProps } = this.props;

    return (
      <React.Fragment>
          <Paper className={classes.root} data-qa-label-header>
            <div className={classes.inner}>
              {error && <Notice text={error} error />}
              <TextField {...labelFieldProps} data-qa-label-input />
              {tagsInputProps && <TagsInput {...tagsInputProps} />}
            </div>
          </Paper>
      </React.Fragment>
    );
  }
}

export default styled(RenderGuard<CombinedProps>(InfoPanel));
