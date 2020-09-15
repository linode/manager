import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import LinodeConfigs from './LinodeConfigs_CMR';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginBottom: theme.spacing(2)
  },
  enclosingGrid: {
    width: '100%'
  },
  paper: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(1),
    marginBottom: theme.spacing(3)
  },
  migrationHeader: {
    paddingTop: theme.spacing()
  },
  migrationCopy: {
    marginTop: theme.spacing()
  },
  sidebar: {
    marginTop: -theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(2) + 24
    }
  }
}));

type CombinedProps = LinodeContextProps;

const LinodeAdvancedConfigurationsPanel: React.FC<CombinedProps> = props => {
  const { linodeLabel } = props;
  const classes = useStyles();

  return (
    <>
      <DocumentTitleSegment
        segment={`${linodeLabel ? `${linodeLabel} - ` : ''} Configurations`}
      />
      <Grid container>
        <Grid item className={classes.enclosingGrid}>
          <LinodeConfigs />
        </Grid>
      </Grid>
    </>
  );
};

interface LinodeContextProps {
  linodeID: number;
  linodeLabel: string;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeID: linode.id,
  linodeLabel: linode.label
}));

const enhanced = compose<CombinedProps, {}>(linodeContext);

export default enhanced(LinodeAdvancedConfigurationsPanel);
