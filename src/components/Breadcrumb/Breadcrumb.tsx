import * as React from 'react';
import { Link } from 'react-router-dom';

import IconButton from '@material-ui/core/IconButton';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import EditableText from 'src/components/EditableText';

type ClassNames = 'root' | 'backButton';

const styles: StyleRulesCallback<ClassNames> = () => ({
  root: {},
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
});

export interface Props {
  backLink: string;
  backText: string;
  text: string;
  errorText?: string;
  onCancel?: () => void;
  onEdit?: (value: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Breadcrumb: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, backLink, backText, text } = props;

  // If `onCancel` and `onEdit` props are passed in, render an EditableText
  // component; otherwise render a Typography component
  const isEditable = (): boolean => {
    return Boolean(props.onCancel && props.onEdit);
  }

  return (
    <React.Fragment>
      <Link to={backLink}>
        <IconButton
          className={classes.backButton}
          >
        <KeyboardArrowLeft />
        <Typography variant="subheading">
          {backText}
        </Typography>
      </IconButton>
      </Link>

      { isEditable() ?
      <EditableText
        role="header"
        variant="headline"
        text={text}
        errorText={props.errorText!}
        onEdit={props.onEdit!}
        onCancel={props.onCancel!}
        data-qa-label
      />
      :
      <Typography role="header" variant="headline">
        {text}
      </Typography>
      }

    </React.Fragment>
  );
}

const styled = withStyles(styles, { withTheme: true });
export default styled<Props>(Breadcrumb);