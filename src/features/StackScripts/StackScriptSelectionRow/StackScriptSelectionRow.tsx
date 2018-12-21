import * as invariant from 'invariant';
import { compose, isEmpty, lensIndex, map, over, splitAt, unless } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose as recompose } from 'recompose';

import Button from 'src/components/Button';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import Radio from 'src/components/Radio';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import ShowMore from 'src/components/ShowMore';
import TableRow from 'src/components/TableRow';
import Tag from 'src/components/Tag';
import StackScriptsActionMenu from 'src/features/StackScripts/StackScriptPanel/StackScriptActionMenu';
import { openStackScriptDrawer as openStackScriptDrawerAction } from 'src/store/reducers/stackScriptDrawer';

type ClassNames = 'root'
  | 'respPadding'
  | 'images'
  | 'libTitleContainer'
  | 'libRadio'
  | 'libRadioLabel'
  | 'libTitle'
  | 'libTitleLink'
  | 'libDescription'
  | 'colImages'
  | 'stackScriptCell'
  | 'stackScriptUsername'
  | 'deployButton'
  | 'detailsButton';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    borderBottom: `solid 1px ${theme.palette.grey['200']}`,
  },
  labelCell: {
    background: theme.bg.offWhite,
    marginBottom: theme.spacing.unit * 2,
  },
  respPadding: {
    [theme.breakpoints.down('md')]: {
      paddingLeft: '78px !important',
    },
  },
  colImages: {
    padding: theme.spacing.unit,
  },
  libTitleContainer: {
    display: 'flex',
  },
  libRadio: {
    display: 'flex',
    flexWrap: 'wrap',
    height: '100%',
    alignItems: 'center',
    width: 70,
  },
  libRadioLabel: {
    cursor: 'pointer',
  },
  libTitle: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: '100%',
    justifyContent: 'space-between',
    paddingBottom: '0 !important',
    '& h3': {
      marginRight: 10,
    },
  },
  libTitleLink: {
    display: 'block',
    marginTop: -1,
    fontSize: '.9rem',
  },
  libDescription: {
    paddingTop: '0 !important',
    [theme.breakpoints.up('md')]: {
      paddingRight: '100px !important',
    },
  },
  images: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  stackScriptCell: {
    maxWidth: '200px',
  },
  stackScriptUsername: {
    color: theme.color.grey1,
  },
  deployButton: {
    // marginLeft: -26,
    // width: '100%',
    // justifyContent: 'flex-start',
    whiteSpace: 'nowrap',
    border: 0,
  },
  detailsButton: {
    textAlign: 'left',
    padding: 0,
  }
});

export interface Props {
  label: string;
  description: string;
  images: string[];
  deploymentsActive: number;
  updated: string;
  disabledCheckedSelect?: boolean;
  onSelect?: (e: any | React.ChangeEvent<HTMLElement>, value: boolean) => void;
  checked?: boolean;
  showDeployLink?: boolean;
  stackScriptID: number;
  stackScriptUsername: string;
  triggerDelete?: (id: number, label: string) => void;
  triggerMakePublic?: (id: number, label: string) => void;
  canDelete: boolean;
  canEdit: boolean;
  isPublic: boolean;
}

interface DispatchProps {
  openStackScriptDrawer: (stackScriptId: number) => void;
}

export type CombinedProps = Props & WithStyles<ClassNames> & DispatchProps & RenderGuardProps;

export class StackScriptSelectionRow extends React.Component<CombinedProps, {}> {
  render() {
    const {
      classes,
      onSelect,
      disabledCheckedSelect,
      checked,
      label,
      description,
      images,
      deploymentsActive,
      updated,
      showDeployLink,
      stackScriptID,
      stackScriptUsername,
      triggerDelete,
      triggerMakePublic,
      canDelete,
      canEdit,
      isPublic,
      openStackScriptDrawer,
    } = this.props;

    /** onSelect and showDeployLink should not be used simultaneously */
    invariant(
      !(onSelect && showDeployLink),
      'onSelect and showDeployLink are mutually exclusive.',
    );

    const renderLabel = () => {

      const openDrawer = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        openStackScriptDrawer(stackScriptID);
      }
      if (showDeployLink) {
        return (
          <React.Fragment>
            <Link to={`/stackscripts/${stackScriptID}`}>
              <Typography role="header" variant="h3">
                {stackScriptUsername &&
                  <span
                    className={`${classes.libRadioLabel} ${classes.stackScriptUsername}`}>
                    {stackScriptUsername} /&nbsp;
                  </span>
                }
                <span
                  className={classes.libRadioLabel}>
                  {label}
                </span>
              </Typography>
            </Link>
            <Typography variant="body1">{description}</Typography>
          </React.Fragment>
        )
      } else {
        return (
          <React.Fragment>
            <Typography role="header" variant="h3">
              {stackScriptUsername &&
                <label
                  htmlFor={`${stackScriptID}`}
                  className={`${classes.libRadioLabel} ${classes.stackScriptUsername}`}>
                  {stackScriptUsername} /&nbsp;
                </label>
              }
              <label
                htmlFor={`${stackScriptID}`}
                className={classes.libRadioLabel}>
                {label}
              </label>
            </Typography>
            <Typography variant="body1">{description}</Typography>
            <Button className={classes.detailsButton} onClick={openDrawer}>
              Show Details
            </Button>
          </React.Fragment>
        )
      }
    }

    return (
      <React.Fragment>
        <TableRow data-qa-table-row={label} rowLink={() => onSelect && onSelect({}, !checked)}>
          {onSelect &&
            <TableCell>
              <Radio checked={checked} onChange={onSelect} id={`${stackScriptID}`} />
            </TableCell>
          }
          {disabledCheckedSelect &&
            <TableCell>
              <Radio checked disabled onChange={onSelect} id={`${stackScriptID}`} />
            </TableCell>
          }
          <TableCell className={classes.stackScriptCell} data-qa-stackscript-title>
            {renderLabel()}
          </TableCell>
          <TableCell>
            <Typography
              role="header"
              variant="h3"
              data-qa-stackscript-deploys
            >
              {deploymentsActive}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography role="header" variant="h3" data-qa-stackscript-revision>{updated}</Typography>
          </TableCell>
          <TableCell className={classes.stackScriptCell} data-qa-stackscript-images>
            {
              displayTagsAndShowMore(images)
            }
          </TableCell>
          {showDeployLink &&
            <TableCell>
            <StackScriptsActionMenu
              stackScriptID={stackScriptID}
              stackScriptUsername={stackScriptUsername}
              stackScriptLabel={label}
              triggerDelete={triggerDelete!}
              triggerMakePublic={triggerMakePublic!}
              canDelete={canDelete}
              canEdit={canEdit}
              isPublic={isPublic}
            />
            </TableCell>
          }
        </TableRow>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch) => {
  return {
    openStackScriptDrawer: (stackScriptId: number) => dispatch(openStackScriptDrawerAction(stackScriptId)),
  };
}

export default recompose<CombinedProps, Props & RenderGuardProps>(
  connect(undefined, mapDispatchToProps),
  RenderGuard,
  withStyles(styles),
)(StackScriptSelectionRow);

const createTag: (images: string) => JSX.Element =
  v => <Tag label={v} key={v} colorVariant="lightBlue" style={{ margin: '2px 2px' }} />;

const createTags: (images: string[]) => JSX.Element[] =
  map(createTag);

const createShowMore: (images: string[]) => JSX.Element =
  images => <ShowMore key={0} items={images} render={createTags} />;

const displayTagsAndShowMore: (s: string[]) => JSX.Element[][] =
  compose<string[], string[][], any, JSX.Element[][]>(
    over(lensIndex(1), unless(isEmpty, createShowMore)),
    over(lensIndex(0), createTags),
    splitAt(3),
  );
