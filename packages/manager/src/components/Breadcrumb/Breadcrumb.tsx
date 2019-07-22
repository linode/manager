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

type ClassNames =
  | 'root'
  | 'preContainer'
  | 'crumbsWrapper'
  | 'crumb'
  | 'noCap'
  | 'crumbLink'
  | 'labelWrapper'
  | 'labelText'
  | 'labelSubtitle'
  | 'editableContainer'
  | 'prefixComponentWrapper'
  | 'slash'
  | 'firstSlash';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'flex-start'
    },
    preContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      marginTop: -3
    },
    crumbsWrapper: {
      display: 'flex',
      alignItems: 'center'
    },
    crumb: {
      whiteSpace: 'nowrap',
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      textTransform: 'capitalize',
      ...theme.typography.h1
    },
    noCap: {
      textTransform: 'initial'
    },
    crumbLink: {
      color: theme.palette.primary.main,
      '&:hover': {
        color: theme.palette.primary.light
      }
    },
    labelWrapper: {
      display: 'flex',
      flexDirection: 'column'
    },
    labelText: {
      padding: `2px 10px`
    },
    labelSubtitle: {
      margin: '4px 0 0 10px'
    },
    editableContainer: {
      marginTop: -10,
      [theme.breakpoints.up('lg')]: {
        marginTop: -9
      }
    },
    prefixComponentWrapper: {
      marginLeft: theme.spacing(1),
      '& svg, & img': {
        position: 'relative',
        marginRight: 4,
        marginLeft: 4,
        top: -2
      }
    },
    slash: {
      fontSize: 24
    },
    firstSlash: {
      marginTop: 6
    }
  });

interface EditableProps {
  onCancel: () => void;
  onEdit: (value: string) => Promise<any>;
  errorText?: string;
  editableTextTitle: string;
}

interface LabelProps {
  linkTo?: string;
  prefixComponent?: JSX.Element | null;
  prefixStyle?: CSSProperties;
  suffixComponent?: JSX.Element | null;
  subtitle?: string;
  noCap?: boolean;
}

interface CrumbOverridesProps {
  position: number;
  linkTo?: LocationDescriptor;
  label?: string;
  noCap?: boolean;
}

export interface Props {
  labelTitle?: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
  removeCrumbX?: number;
  crumbOverrides?: CrumbOverridesProps[];
  className?: string;
  pathname: string;
}

export type CombinedProps = Props & WithStyles<ClassNames>;

export class Breadcrumb extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      labelTitle,
      labelOptions,
      onEditHandlers,
      removeCrumbX,
      crumbOverrides,
      className,
      pathname
    } = this.props;

    const url = pathname && pathname.slice(1);
    const allPaths = url.split('/');

    const removeByIndex = (list: string[], indexToRemove: number) => {
      return list.filter((value, index) => {
        return index !== indexToRemove;
      });
    };

    const Crumbs = () => {
      const paths = allPaths;
      const pathMap = removeCrumbX
        ? removeByIndex(paths, removeCrumbX - 1)
        : paths;
      const lastCrumb = pathMap.slice(-1)[0];

      return (
        <>
          {pathMap.slice(0, -1).map((crumb: string, key: number) => {
            const link =
              '/' + paths.slice(0, -(paths.length - (key + 1))).join('/');
            const override =
              crumbOverrides &&
              crumbOverrides.find(e => e.position === key + 1);

            return (
              <div key={key} className={classes.crumbsWrapper}>
                <Link
                  to={
                    crumbOverrides && override
                      ? override.linkTo
                        ? override.linkTo
                        : link
                      : link
                  }
                  data-qa-link
                >
                  <Typography
                    className={classNames({
                      [classes.crumb]: true,
                      [classes.crumbLink]: true,
                      [classes.noCap]: override && override.noCap
                    })}
                    data-qa-link-text
                    data-testid={'link-text'}
                  >
                    {crumbOverrides && override
                      ? override.label
                        ? override.label
                        : crumb
                      : crumb}
                  </Typography>
                </Link>
                <Typography component="span" className={classes.slash}>
                  /
                </Typography>
              </div>
            );
          })}

          {labelOptions && labelOptions.prefixComponent && (
            <>
              <div
                className={classes.prefixComponentWrapper}
                data-qa-prefixwrapper
                style={labelOptions.prefixStyle && labelOptions.prefixStyle}
              >
                {labelOptions.prefixComponent}
              </div>
            </>
          )}

          {labelTitle ? (
            <div className={classes.labelWrapper}>
              <Typography
                variant="h1"
                className={classNames({
                  [classes.crumb]: true,
                  [classes.noCap]: labelOptions && labelOptions.noCap
                })}
                data-qa-label-text
              >
                {labelTitle}
              </Typography>
              {labelOptions && labelOptions.subtitle && (
                <Typography
                  variant="body1"
                  className={classes.labelSubtitle}
                  data-qa-label-subtitle
                >
                  {labelOptions.subtitle}
                </Typography>
              )}
            </div>
          ) : onEditHandlers ? (
            <EditableText
              typeVariant="h2"
              text={onEditHandlers.editableTextTitle}
              errorText={onEditHandlers.errorText}
              onEdit={onEditHandlers.onEdit}
              onCancel={onEditHandlers.onCancel}
              labelLink={labelOptions && labelOptions.linkTo}
              data-qa-editable-text
              className={classes.editableContainer}
            />
          ) : (
            <div className={classes.labelWrapper}>
              <Typography
                className={classNames({
                  [classes.crumb]: true,
                  [classes.noCap]: labelOptions && labelOptions.noCap
                })}
                data-qa-label-text
              >
                {lastCrumb}
              </Typography>
              {labelOptions && labelOptions.subtitle && (
                <Typography
                  variant="h1"
                  className={classes.labelSubtitle}
                  data-qa-label-subtitle
                >
                  {labelOptions.subtitle}
                </Typography>
              )}
            </div>
          )}
        </>
      );
    };

    return (
      <div className={`${classes.root} ${className}`}>
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
          <Crumbs />
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
