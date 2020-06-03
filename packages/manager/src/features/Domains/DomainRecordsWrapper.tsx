import { Domain, DomainRecord } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TagsPanel from 'src/components/TagsPanel';
import summaryPanelStyles, {
  StyleProps
} from 'src/containers/SummaryPanels.styles';
import DeleteDomain from './DeleteDomain';
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
      marginTop: theme.spacing(1)
    }
  },
  tagPanel: {
    maxWidth: 500
  }
}));

interface Props {
  domain: Domain;
  records: DomainRecord[];
  updateRecords: () => void;
  handleUpdateTags: (tagList: string[]) => Promise<Domain>;
}

type CombinedProps = Props & StyleProps;

const DomainRecordsWrapper: React.FC<CombinedProps> = props => {
  const { domain, records, updateRecords, handleUpdateTags, classes } = props;
  const hookClasses = useStyles();
  const history = useHistory();

  return (
    <Grid container className={hookClasses.root}>
      <Grid item xs={12} className={hookClasses.main}>
        <DomainRecords
          domain={domain}
          domainRecords={records}
          updateRecords={updateRecords}
        />
      </Grid>
      <Grid
        item
        xs={12}
        className={`${hookClasses.sidebar} ${hookClasses.domainSidebar}`}
        id="domains-tag-section"
      >
        <Paper className={classes.summarySection}>
          <Typography variant="h3" className={classes.title} data-qa-title>
            Tags
          </Typography>
          <div className={hookClasses.tagPanel}>
            <TagsPanel tags={domain.tags} updateTags={handleUpdateTags} />
          </div>
        </Paper>
        <div className={hookClasses.tagPanel}>
          <DeleteDomain
            domainId={domain.id}
            domainLabel={domain.domain}
            onSuccess={() => history.push('/domains')}
          />
        </div>
      </Grid>
    </Grid>
  );
};

const styled = withStyles(summaryPanelStyles);

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(DomainRecordsWrapper);
