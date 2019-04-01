import * as React from 'react';
import { compose } from 'recompose';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import AddNewLink from 'src/components/AddNewLink';
import CircleProgress from 'src/components/CircleProgress';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Placeholder from 'src/components/Placeholder';
import bucketContainer, { StateProps } from 'src/containers/bucket.container';
import bucketDrawerContainer, {
  DispatchProps
} from 'src/containers/bucketDrawer.container';
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

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

export const ObjectStorageLanding: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
    bucketsData,
    bucketsLoading,
    bucketsError,
    openBucketDrawer
  } = props;

  if (bucketsLoading) {
    return <RenderLoading data-qa-loading-state />;
  }

  if (bucketsError) {
    return <RenderError data-qa-error-state />;
  }

  if (bucketsData.length === 0) {
    return <RenderEmpty onClick={openBucketDrawer} data-qa-empty-state />;
  }

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
          <Typography variant="h1" data-qa-title className={classes.title}>
            Buckets
          </Typography>
        </Grid>
        <Grid item>
          <Grid container>
            <Grid item className="pt0">
              <AddNewLink onClick={openBucketDrawer} label="Add a Bucket" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
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

const RenderLoading: React.StatelessComponent<{}> = () => {
  return <CircleProgress />;
};

const RenderError: React.StatelessComponent<{}> = () => {
  return (
    <ErrorState errorText="There was an error retrieving your buckets. Please reload and try again." />
  );
};

const RenderEmpty: React.StatelessComponent<{
  onClick: () => void;
}> = props => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      <Placeholder
        title="Add a Bucket"
        copy="Click below to add a Bucket and start using Object Storage today."
        // @todo: replace with bucket icon
        icon={VolumeIcon}
        buttonProps={{
          onClick: props.onClick,
          children: 'Add a Bucket'
        }}
      />
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  bucketContainer,
  bucketDrawerContainer
);

export default enhanced(ObjectStorageLanding);
