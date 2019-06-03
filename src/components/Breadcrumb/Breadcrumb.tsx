import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import { LocationDescriptor } from 'history';
import * as React from 'react';
import { Link } from 'react-router-dom';
import IconButton from 'src/components/core/IconButton';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EditableText from 'src/components/EditableText';
import LabelText from './LabelText';

type ClassNames =
  | 'root'
  | 'backButton'
  | 'linkText'
  | 'linkTextWrapper'
  | 'labelText'
  | 'subtitleLinkText'
  | 'prefixComponentWrapper';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  backButton: {
    margin: '0',
    padding: '0',
    width: 'auto',
    height: 'auto',
    '& svg': {
      position: 'relative',
      top: 2,
      width: 24,
      height: 24
    }
  },
  linkText: {
    display: 'flex',
    alignItems: 'center',
    color: '#3683DC',
    borderColor: theme.color.grey,
    whiteSpace: 'nowrap',
    '&:after': {
      content: "''",
      display: 'inline-block',
      padding: '0 8px 0 6px',
      height: '39px',
      borderRight: `1px solid ${theme.color.grey1}`
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  linkTextWrapper: {
    position: 'relative',
    top: 2
  },
  subtitleLinkText: {
    display: 'flex',
    alignItems: 'flex-start',
    color: '#3683DC',
    borderColor: theme.color.grey,
    whiteSpace: 'nowrap',
    '&:after': {
      content: "''",
      display: 'inline-block',
      padding: '0 0 0 8px',
      color: theme.color.grey1,
      borderRight: `1px solid ${theme.color.grey1}`,
      height: 24,
      marginTop: -7,
      position: 'relative',
      top: 4
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  labelText: {
    padding: '2px 10px'
  },
  prefixComponentWrapper: {
    marginLeft: '14px',
    '& svg': {
      position: 'relative',
      top: 2,
      marginRight: '0'
    }
  }
});
interface EditableProps {
  onCancel: () => void;
  onEdit: (value: string) => Promise<any>;
  errorText?: string;
}

interface LabelProps {
  linkTo?: string;
  prefixComponent?: JSX.Element | null;
  subtitle?: string;
}
export interface Props {
  // linkTo will be passed in to a <Link /> component, so we borrow the
  // LocationDescriptor interface from the history module
  linkTo: LocationDescriptor;
  linkText?: string;
  labelTitle: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const Breadcrumb: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    linkTo,
    linkText,
    labelTitle,
    labelOptions,
    onEditHandlers
  } = props;

  return (
    <React.Fragment>
      <Link to={linkTo} data-qa-link>
        <IconButton className={classes.backButton} tabIndex={-1}>
          <KeyboardArrowLeft />
          {linkText && (
            <Typography
              variant="h3"
              className={
                labelOptions && labelOptions.subtitle
                  ? classes.subtitleLinkText
                  : classes.linkText
              }
              data-qa-link-text
            >
              <span className={classes.linkTextWrapper}>{linkText}</span>
            </Typography>
          )}
        </IconButton>
      </Link>

      {labelOptions && labelOptions.prefixComponent && (
        <div className={classes.prefixComponentWrapper} data-qa-prefixwrapper>
          {labelOptions.prefixComponent}
        </div>
      )}

      {onEditHandlers ? (
        <EditableText
          typeVariant="h2"
          text={labelTitle}
          errorText={onEditHandlers.errorText}
          onEdit={onEditHandlers.onEdit}
          onCancel={onEditHandlers.onCancel}
          labelLink={labelOptions && labelOptions.linkTo}
          data-qa-editable-text
        />
      ) : (
        <LabelText
          title={props.labelTitle}
          subtitle={labelOptions && labelOptions.subtitle}
          titleLink={labelOptions && labelOptions.linkTo}
          data-qa-labeltext
        />
      )}
    </React.Fragment>
  );
};

const styled = withStyles(styles);
export default styled(Breadcrumb);
