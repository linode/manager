import * as React from 'react';
import { Link } from 'react-router-dom';
import * as invariant from 'invariant';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';

import Typography from 'material-ui/Typography';
import Grid from 'src/components/Grid';
import Radio from 'src/components/Radio';
import Tag from 'src/components/Tag';

type ClassNames = 'root' | 'images';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    borderBottom: `solid 1px ${theme.palette.grey['200']}`,
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

      <Grid item xs={onSelect ? 7 : 6}>
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

      <Grid item xs={1}>
        <Typography variant="subheading">{updated}</Typography>
      </Grid>

      <Grid item xs={2}>
        {
          images.map(v => (
            <Tag
              label={v}
              key={v}
              variant="blue"
              className={classes.images}
            />
          ))
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

export default styled<Props>(SelectionRow);
