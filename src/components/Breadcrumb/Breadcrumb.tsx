import { LocationDescriptor } from 'history';
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
import LabelText from './LabelText';

type ClassNames = 'root' | 'backButton' | 'linkText' | 'labelText' | 'subtitleLinkText';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  backButton: {
    margin: '0',
    width: 'auto',
    height: 'auto',
    '& svg': {
      width: 20,
      height: 20,
    },
  },
  linkText: {
    display: 'flex',
    alignItems: 'center',
    color: '#3683DC',
    textDecoration: 'underline',
    borderColor: theme.color.grey,
    '&:after': {
      content: "''",
      display: 'inline-block',
      padding: '0 8px 0 6px',
      height: '38px',
      borderRight: `1px solid ${theme.color.grey1}`,
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  subtitleLinkText: {
    display: 'flex',
    alignItems: 'flex-start',
    color: '#3683DC',
    textDecoration: 'underline',
    borderColor: theme.color.grey,
    '&:after': {
      content: "'|'",
      display: 'inline-block',
      padding: '0 0 0 8px',
      color: theme.color.grey1,
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  labelText: {
    padding: '2px 10px'
  }
});
interface EditableProps {
  onCancel: () => void;
  onEdit: (value: string) => void;
  errorText?: string;
}
export interface Props {
  // linkTo will be passed in to a <Link /> component, so we borrow the
  // LocationDescriptor interface from the history module
  linkTo: LocationDescriptor;
  linkText: string;
  labelTitle: string;
  labelLink?: string;
  labelSubtitle?: string;
  onEditHandlers?: EditableProps
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const Breadcrumb: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linkTo, linkText, labelTitle } = props;

  return (
    <React.Fragment>
      <Link to={linkTo} data-qa-link>
        <IconButton
          className={classes.backButton}
          >
        <KeyboardArrowLeft />
        <Typography
          variant="subheading"
          className={props.labelSubtitle ? classes.subtitleLinkText : classes.linkText}
          data-qa-link-text
        >
          {linkText}
        </Typography>
      </IconButton>
      </Link>
      {props.onEditHandlers
        ?
        <EditableText
          role="header"
          variant="headline"
          text={labelTitle}
          errorText={props.onEditHandlers!.errorText}
          onEdit={props.onEditHandlers!.onEdit}
          onCancel={props.onEditHandlers!.onCancel}
          labelLink={props.labelLink}
          data-qa-editable-text
        />
        : <LabelText
            title={props.labelTitle}
            subtitle={props.labelSubtitle}
            titleLink={props.labelLink}
            data-qa-labeltext
          />
      }
    </React.Fragment>
  );
}

const styled = withStyles(styles, { withTheme: true });
export default styled<Props>(Breadcrumb);