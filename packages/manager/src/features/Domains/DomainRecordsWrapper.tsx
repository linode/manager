import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TagsPanel from 'src/components/TagsPanel';
import summaryPanelStyles, {
  StyleProps
} from 'src/containers/SummaryPanels.styles';
import DomainRecords from './DomainRecords';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2)
  },
  main: {
    [theme.breakpoints.up('md')]: {
      order: 1
    }
  },
  sidebar: {
    [theme.breakpoints.up('md')]: {
      order: 2
    }
  },
  domainSidebar: {
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(1) + 24
    }
  }
}));

interface Props {
  domain: Linode.Domain;
  records: Linode.DomainRecord[];
  updateRecords: () => void;
  handleUpdateTags: (tagList: string[]) => Promise<Linode.Domain>;
}

type CombinedProps = Props & StyleProps;

const DomainRecordsWrapper: React.FC<CombinedProps> = props => {
  const { domain, records, updateRecords, handleUpdateTags, classes } = props;
  const hookClasses = useStyles();

  return (
    <Grid container className={hookClasses.root}>
      <Grid
        item
        xs={12}
        md={3}
        className={`${hookClasses.sidebar} ${hookClasses.domainSidebar}`}
      >
        <Paper className={classes.summarySection}>
          <Typography variant="h3" className={classes.title} data-qa-title>
            Tags
          </Typography>
          <TagsPanel tags={domain.tags} updateTags={handleUpdateTags} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={9} className={hookClasses.main}>
        <DomainRecords
          domain={domain}
          domainRecords={records}
          updateRecords={updateRecords}
        />
      </Grid>
    </Grid>
  );
};

const styled = withStyles(summaryPanelStyles);

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(DomainRecordsWrapper);
