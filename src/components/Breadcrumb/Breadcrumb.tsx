import * as classNames from 'classnames';
import { LocationDescriptor } from 'history';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  createStyles,
  CSSProperties,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EditableText from 'src/components/EditableText';
import LabelText from './LabelText';

type ClassNames =
  | 'root'
  | 'preContainer'
  | 'linkText'
  | 'labelText'
  | 'prefixComponentWrapper'
  | 'slash'
  | 'firstSlash';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    preContainer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: -3
    },
    linkText: {
      whiteSpace: 'nowrap',
      marginRight: theme.spacing(1),
      ...theme.typography.h1,
      color: theme.palette.primary.main,
      '&:hover': {
        color: theme.palette.primary.light
      }
    },
    labelText: {
      padding: `2px 10px`
    },
    prefixComponentWrapper: {
      marginLeft: theme.spacing(1),
      '& svg, & img': {
        position: 'relative',
        marginRight: 4,
        marginLeft: 4
      }
    },
    slash: {
      fontSize: 24
    },
    firstSlash: {
      marginRight: theme.spacing(1)
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
  suffixComponent?: JSX.Element | null;
  subtitle?: string;
  style?: CSSProperties;
}
export interface Props {
  // linkTo will be passed in to a <Link /> component, so we borrow the
  // LocationDescriptor interface from the history module
  linkTo: LocationDescriptor;
  linkText?: string;
  labelTitle: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
  prefixStyle?: CSSProperties;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const Breadcrumb: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    linkTo,
    linkText,
    labelTitle,
    labelOptions,
    onEditHandlers,
    prefixStyle
  } = props;

  return (
    <div className={classes.root}>
      <div className={classes.preContainer}>
        <Typography
          component="span"
          className={classNames({
            [classes.slash]: true,
            [classes.firstSlash]: true
          })}
        >
          /
        </Typography>
        <Link to={linkTo} data-qa-link>
          {linkText && (
            <Typography className={classes.linkText} data-qa-link-text>
              {linkText}
            </Typography>
          )}
        </Link>
        {labelOptions && labelOptions.prefixComponent && (
          <>
            <Typography component="span" className={classes.slash}>
              /
            </Typography>
            <div
              className={classes.prefixComponentWrapper}
              data-qa-prefixwrapper
              style={prefixStyle && prefixStyle}
            >
              {labelOptions.prefixComponent}
            </div>
          </>
        )}
        {!(labelOptions && labelOptions.prefixComponent) && (
          <Typography component="span" className={classes.slash}>
            /
          </Typography>
        )}
      </div>
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
          style={labelOptions && labelOptions.style}
          data-qa-labeltext
        />
      )}
      {labelOptions &&
        labelOptions.suffixComponent &&
        labelOptions.suffixComponent}
    </div>
  );
};

const styled = withStyles(styles);
export default styled(Breadcrumb);
