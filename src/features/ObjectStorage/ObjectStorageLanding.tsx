import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import bucketContainer, {
  Props as BucketContainerProps
} from 'src/containers/bucket.container';
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

type CombinedProps = BucketContainerProps & WithStyles<ClassNames>;

export const ObjectStorageLanding: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, bucketsData } = props;

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
        <OrderBy data={bucketsData} order={'asc'} orderBy={'label'}>
          {({ data: orderedData, handleOrderChange, order, orderBy }) => {
            const listBucketsProps = {
              orderBy,
              order,
              handleOrderChange,
              data: orderedData
            };
            return <ListBuckets {...listBucketsProps} />;
          }}
        </OrderBy>
      </Grid>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  bucketContainer
);

export default enhanced(ObjectStorageLanding);
