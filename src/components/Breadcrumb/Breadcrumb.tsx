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

type ClassNames = 'root' | 'backButton' | 'linkText' | 'labelText' | 'underlineOnHover';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  backButton: {
    margin: '5px 0 0 0',
    width: 'auto',
    '& svg': {
      width: 26,
      height: 26,
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
  labelText: {
    padding: '5px 10px'
  },
  underlineOnHover: {
    '&:hover, &:focus': {
      textDecoration: 'underline',
      color: theme.color.black,
    },
  }
});

export interface Props {
  linkTo: string;
  linkText: string;
  label: string;
  labelLink?: string | undefined;
  errorText?: string;
  onCancel?: () => void;
  onEdit?: (value: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const Breadcrumb: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linkTo, linkText, label } = props;

  const isEditable = Boolean(props.onCancel && props.onEdit);

  const labelText = (
    <Typography
      role="header"
      variant="headline"
      className={classes.labelText}
      data-qa-static-text
    >
      {label}
    </Typography>
  );

  return (
    <React.Fragment>
      <Link to={linkTo} data-qa-link>
        <IconButton
          className={classes.backButton}
          >
        <KeyboardArrowLeft />
        <Typography
          variant="subheading"
          className={classes.linkText}
          data-qa-link-text
        >
          {linkText}
        </Typography>
      </IconButton>
      </Link>
      {isEditable
        ?
        <EditableText
          role="header"
          variant="headline"
          text={label}
          errorText={props.errorText!}
          onEdit={props.onEdit!}
          onCancel={props.onCancel!}
          labelLink={props.labelLink}
          data-qa-editable-text
        />
        : props.labelLink
          ? <Link to={props.labelLink!} data-qa-label-link>
              <span className={classes.underlineOnHover}>{labelText}</span>
            </Link>
          :  labelText
      }
    </React.Fragment>
  );
}

const styled = withStyles(styles, { withTheme: true });
export default styled<Props>(Breadcrumb);