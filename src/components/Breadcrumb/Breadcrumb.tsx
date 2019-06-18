import { LocationDescriptor } from 'history';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EditableText from 'src/components/EditableText';
import LabelText from './LabelText';

type ClassNames =
  | 'root'
  | 'linkText'
  | 'labelText'
  | 'prefixComponentWrapper'
  | 'slash';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
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
      padding: '2px 10px'
    },
    prefixComponentWrapper: {
      marginLeft: '14px',
      '& svg': {
        position: 'relative',
        top: 2,
        marginRight: '0'
      }
    },
    slash: {
      fontSize: 24
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
        {linkText && (
          <Typography className={classes.linkText} data-qa-link-text>
            {linkText}
          </Typography>
        )}
      </Link>
      {labelOptions && labelOptions.prefixComponent && (
        <div className={classes.prefixComponentWrapper} data-qa-prefixwrapper>
          {labelOptions.prefixComponent}
        </div>
      )}
      <Typography component="span" className={classes.slash}>
        /
      </Typography>
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
