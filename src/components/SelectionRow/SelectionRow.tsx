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

type ClassNames = 'root' | 'images' | 'colImages';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    borderBottom: `solid 1px ${theme.palette.grey['200']}`,
  },
  colImages: {
    padding: theme.spacing.unit,
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
  } = props;

  /** onSelect and showDeployLink should not be used simultaneously */
  invariant(
    !(onSelect && showDeployLink),
    'onSelect and showDeployLink are mutually exclusive.',
  );

  return (
    <Grid container className={classes.root}>

      {onSelect &&
        <Grid item xs={1}>
          <Grid container alignItems="center" style={{ height: '100%' }}>
            <Grid item xs={12}>
              <Radio checked={checked} onChange={onSelect} />
            </Grid>
          </Grid>
        </Grid>
      }

      <Grid item xs={onSelect ? 5 : 4}>
        <Grid container alignItems="center" style={{ height: '100%' }}>
          <Grid item xs={12}>
            <Link to={'/'}>
              <Typography variant="title">
                {label}
              </Typography>
            </Link>
          </Grid>
          <Grid item xs={12}>
            <Typography>{description}</Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={1}>
        <Typography variant="subheading">{deploymentsActive}</Typography>
      </Grid>

      <Grid item xs={2}>
        <Typography variant="subheading">{updated}</Typography>
      </Grid>

      <Grid item xs={3} className={classes.colImages}>
        {
          displayTagsAndShowMore(images)
        }
      </Grid>

      {showDeployLink &&
        <Grid item xs={2}>
          <Grid container alignItems="center" style={{ height: '100%' }}>
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
  v => <Tag label={v} key={v} variant="blue" style={{ margin: '2px 2px' }} />;

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
