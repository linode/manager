import * as React from 'react';
import { compose, map, unless, isEmpty, over, lensIndex, splitAt } from 'ramda';
import { Link } from 'react-router-dom';
import * as invariant from 'invariant';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';

import Typography from 'material-ui/Typography';
import Grid from 'src/components/Grid';
import Radio from 'src/components/Radio';
import Tag from 'src/components/Tag';
import ShowMore from 'src/components/ShowMore';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root'
  | 'respPadding'
  | 'images'
  | 'libTitleContainer'
  | 'libRadio'
  | 'libRadioLabel'
  | 'libTitle'
  | 'libTitleLink'
  | 'libDescription'
  | 'colImages';

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
  } = props;

  /** onSelect and showDeployLink should not be used simultaneously */
  invariant(
    !(onSelect && showDeployLink),
    'onSelect and showDeployLink are mutually exclusive.',
  );

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} lg={onSelect ? 6 : 5} className={classes.libTitleContainer}>
        {onSelect &&
          <Grid item className={classes.libRadio}>
            <div>
              <Radio checked={checked} onChange={onSelect} id={`${stackScriptID}`} />
            </div>
          </Grid>
        }
        <Grid container alignItems="center">
          <Grid item className={classes.libTitle}>
            <Typography variant="subheading">
              <label htmlFor={`${stackScriptID}`} className={classes.libRadioLabel}>{label}</label>
            </Typography>
            <Link to={'/'} target="_blank" className={classes.libTitleLink}>
              More Info
            </Link>
          </Grid>
          <Grid item xs={12} className={classes.libDescription}>
            <Typography>{description}</Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} lg={1} className={classes.respPadding}>
        <Typography variant="subheading">{deploymentsActive}</Typography>
      </Grid>

      <Grid item xs={12} lg={2} className={classes.respPadding}>
        <Typography variant="subheading">{updated}</Typography>
      </Grid>

      <Grid item xs={12} lg={3} className={`${classes.colImages} ${classes.respPadding}`}>
        {
          displayTagsAndShowMore(images)
        }
      </Grid>

      {showDeployLink &&
        <Grid item xs={2}>
          <Grid container alignItems="center">
            <Grid item xs={12}>
              <Link to={'/'}>
                <Typography variant="title">
                  Deploy New Linode
              </Typography>
              </Link>
            </Grid>
          </Grid>
        </Grid>
      }
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(RenderGuard<CombinedProps>(SelectionRow));

const createTag: (images: string) => JSX.Element =
  v => <Tag label={v} key={v} variant="lightGray" style={{ margin: '2px 2px' }} />;

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
