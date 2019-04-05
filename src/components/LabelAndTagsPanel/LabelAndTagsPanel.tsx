import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TagsInput, { TagsInputProps } from 'src/components/TagsInput';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

type ClassNames = 'root' | 'inner' | 'expPanelButton';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white
  },
  inner: {
    padding: theme.spacing.unit * 3
  },
  expPanelButton: {
    padding: 0,
    marginTop: theme.spacing.unit * 2
  }
});

const styled = withStyles(styles);

interface Props {
  error?: string;
  labelFieldProps?: TextFieldProps;
  tagsInputProps?: TagsInputProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class InfoPanel extends React.Component<CombinedProps> {
  static defaultProps: Partial<Props> = {
    labelFieldProps: {
      label: 'Label',
      placeholder: 'Enter a Label'
    }
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

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  styled
)(InfoPanel);
