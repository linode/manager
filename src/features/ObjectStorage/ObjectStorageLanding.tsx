import * as React from 'react';
import { compose } from 'recompose';
import { buckets } from 'src/__data__/buckets';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import ListBuckets from './ListBuckets';

type ClassNames = 'root' | 'titleWrapper' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  titleWrapper: {
    flex: 1
  },
  title: {
    marginBottom: theme.spacing.unit + theme.spacing.unit / 2
  }
});

type CombinedProps = WithStyles<ClassNames>;

export const ObjectStorageLanding: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes } = props;

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      <Grid
        container
        justify="space-between"
        alignItems="flex-end"
        style={{ paddingBottom: 0 }}
      >
        <Grid item className={classes.titleWrapper}>
          <Typography
            role="header"
            variant="h1"
            data-qa-title
            className={classes.title}
          >
            Buckets
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {/* @todo: source buckets from Redux (via API) */}
        <OrderBy data={buckets} order={'asc'} orderBy={'label'}>
          {({ data: orderedData, handleOrderChange, order, orderBy }) => {
            const props = {
              orderBy,
              order,
              handleOrderChange,
              data: orderedData
            };
            return <ListBuckets {...props} />;
          }}
        </OrderBy>
      </Grid>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(styled);

export default enhanced(ObjectStorageLanding);
