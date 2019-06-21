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
// import LabelText from './LabelText';

type ClassNames =
  | 'root'
  | 'preContainer'
  | 'crumb'
  | 'crumbLink'
  | 'labelText'
  | 'prefixComponentWrapper'
  | 'slash';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'flex-start'
    },
    preContainer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: -3
    },
    crumb: {
      whiteSpace: 'nowrap',
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      ...theme.typography.h1
    },
    crumbLink: {
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
    }
  });

interface State {
  paths: any;
}

interface EditableProps {
  onCancel: () => void;
  onEdit: (value: string) => Promise<any>;
  errorText?: string;
  editableTextTitle: string;
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
  labelTitle?: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
  prefixStyle?: CSSProperties;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class Breadcrumb extends React.Component<CombinedProps, State> {
  state = {
    paths: []
  };
  componentDidMount() {
    const pathName = document.location.pathname.slice(1);
    const paths = pathName.split('/');
    this.setState({
      paths
    });
  }

  render() {
    const {
      classes,
      // linkTo,
      // linkText,
      labelTitle,
      labelOptions,
      onEditHandlers,
      prefixStyle
    } = this.props;

    const Crumbs = () => {
      const { paths } = this.state;
      return (
        <>
          {paths.slice(0, -1).map((crumb, key) => {
            const link =
              '/' + paths.slice(0, -(paths.length - (key + 1))).join('/');
            return (
              <React.Fragment key={key}>
                <Link to={link} data-qa-link>
                  <Typography
                    className={classNames({
                      [classes.crumb]: true,
                      [classes.crumbLink]: true
                    })}
                    data-qa-link-text
                  >
                    {crumb}
                  </Typography>
                </Link>
                <Typography component="span" className={classes.slash}>
                  /
                </Typography>
              </React.Fragment>
            );
          })}

          {labelTitle ? (
            <Typography
              className={classNames({
                [classes.crumb]: true
              })}
              data-qa-link-text
            >
              {labelTitle}
            </Typography>
          ) : onEditHandlers ? (
            <EditableText
              typeVariant="h2"
              text={onEditHandlers.editableTextTitle}
              errorText={onEditHandlers.errorText}
              onEdit={onEditHandlers.onEdit}
              onCancel={onEditHandlers.onCancel}
              labelLink={labelOptions && labelOptions.linkTo}
              data-qa-editable-text
            />
          ) : (
            paths.splice(-1, 1).map(crumb => (
              <Typography
                className={classNames({
                  [classes.crumb]: true
                })}
                data-qa-link-text
              >
                {crumb}
              </Typography>
            ))
          )}
        </>
      );
    };

    return (
      <div className={classes.root}>
        <div className={classes.preContainer}>
          <Typography
            component="span"
            className={classNames({
              [classes.slash]: true
            })}
          >
            /
          </Typography>
          <Crumbs />
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
          {/* {!(labelOptions && labelOptions.prefixComponent) && (
            <Typography component="span" className={classes.slash}>
              /
            </Typography>
          )} */}
        </div>
        {labelOptions &&
          labelOptions.suffixComponent &&
          labelOptions.suffixComponent}
      </div>
    );
  }
}

const styled = withStyles(styles);
export default styled(Breadcrumb);
