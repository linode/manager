import * as React from 'react';
import { Link } from 'react-router-dom';

import * as invariant from 'invariant';

import { compose, isEmpty, lensIndex, map, over, splitAt, unless } from 'ramda';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import Button from 'src/components/Button';
import Radio from 'src/components/Radio';
import RenderGuard from 'src/components/RenderGuard';
import ShowMore from 'src/components/ShowMore';
import Tag from 'src/components/Tag';

import Typography from '@material-ui/core/Typography';

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

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
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
    marginLeft: -26,
    border: 0,
    width: '100%',
    justifyContent: 'flex-start',
  },
});

export interface Props {
  label: string;
  description: string;
  images: string[];
  deploymentsActive: number;
  updated: string;
  onSelect?: (e: React.ChangeEvent<HTMLElement>, value: boolean) => void;
  checked?: boolean;
  showDeployLink?: boolean;
  stackScriptID?: number;
  stackScriptUsername?: string;
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
  } = props;

  /** onSelect and showDeployLink should not be used simultaneously */
  invariant(
    !(onSelect && showDeployLink),
    'onSelect and showDeployLink are mutually exclusive.',
  );

  return (
    <React.Fragment>
      <TableRow>
        {onSelect &&
          <TableCell>
            <Radio checked={checked} onChange={onSelect} id={`${stackScriptID}`} />
          </TableCell>
        }
        <TableCell className={classes.stackScriptCell}>
          <Typography variant="subheading">
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
          <Typography>{description}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="subheading">{deploymentsActive}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="subheading">{updated}</Typography>
        </TableCell>
        <TableCell className={classes.stackScriptCell}>
          {
            displayTagsAndShowMore(images)
          }
        </TableCell>
        {showDeployLink &&
          <TableCell>
          <Link to={`/linodes/create?type=fromStackScript` +
            `&stackScriptID=${stackScriptID}&stackScriptUsername=${stackScriptUsername}`}>
            <Button
              type="secondary"
              className={classes.deployButton}
            >
              Deploy New Linode
            </Button>
          </Link>
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
