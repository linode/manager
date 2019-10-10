import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import DocumentationButton from 'src/components/DocumentationButton';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  line: {
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(3)
  }
}));

type CombinedProps = RouteComponentProps;

const LongviewContent: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb pathname={props.location.pathname} labelTitle="Longview" />
        <DocumentationButton href={'https://google.com'} />
      </Box>
      <Divider className={classes.line} type="landingHeader" />
      <Grid
        container
        justify="flex-end"
        alignItems="flex-end"
        style={{ paddingBottom: 0 }}
      >
        <Grid item>
          <Grid container alignItems="flex-end">
            <Grid item className="pt0">
              <AddNewLink onClick={() => null} label="Add a Client" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default compose<CombinedProps, RouteComponentProps>(React.memo)(
  LongviewContent
);
