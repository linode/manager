import * as invariant from 'invariant';
import { compose, isEmpty, lensIndex, map, over, splitAt, unless } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';

import Radio from 'src/components/Radio';
import RenderGuard from 'src/components/RenderGuard';
import ShowMore from 'src/components/ShowMore';
import TableRow from 'src/components/TableRow';
import Tag from 'src/components/Tag';
import StackScriptsActionMenu from 'src/features/StackScripts/SelectStackScriptPanel/StackScriptActionMenu';

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
  | 'deployButton';

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
});

export interface Props {
  label: string;
  description: string;
  images: string[];
  deploymentsActive: number;
  updated: string;
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

type CombinedProps = Props & WithStyles<ClassNames>;

const SelectionRow: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    onSelect,
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
  } = props;

  /** onSelect and showDeployLink should not be used simultaneously */
  invariant(
    !(onSelect && showDeployLink),
    'onSelect and showDeployLink are mutually exclusive.',
  );

  const renderLabel = () => {
    return (
      <Typography role="header" variant="subheading">
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
    )
  }

  return (
    <React.Fragment>
      <TableRow data-qa-table-row={label} rowLink={() => onSelect && onSelect({}, !checked)}>
        {onSelect &&
          <TableCell>
            <Radio checked={checked} onChange={onSelect} id={`${stackScriptID}`} />
          </TableCell>
        }
        <TableCell className={classes.stackScriptCell} data-qa-stackscript-title>
          {!showDeployLink
            ? renderLabel()
            : <a target="_blank" href={`https://www.linode.com/stackscripts/view/${stackScriptID}`}>
              {renderLabel()}
            </a>
          }
          <Typography variant="caption">{description}</Typography>
        </TableCell>
        <TableCell>
          <Typography
            role="header"
            variant="subheading"
            data-qa-stackscript-deploys
          >
            {deploymentsActive}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography role="header" variant="subheading" data-qa-stackscript-revision>{updated}</Typography>
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
};

const styled = withStyles(styles, { withTheme: true });

export default styled(RenderGuard<CombinedProps>(SelectionRow));

const createTag: (images: string) => JSX.Element =
  v => <Tag label={v} key={v} variant="lightBlue" style={{ margin: '2px 2px' }} />;

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
