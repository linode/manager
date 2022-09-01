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
  StyleProps,
} from 'src/containers/SummaryPanels.styles';
import { useUpdateDomainMutation } from 'src/queries/domains';
import DeleteDomain from './DeleteDomain';
import DomainRecords from './DomainRecords';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginLeft: 0,
    marginRight: 0,
    marginBottom: theme.spacing(3),
  },
  main: {
    '&.MuiGrid-item': {
      padding: 0,
    },
    [theme.breakpoints.up('md')]: {
      order: 1,
    },
  },
  tagsSection: {
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(1),
      order: 2,
    },
    '&.MuiGrid-item': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  delete: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
    },
  },
}));

interface Props {
  domain: Domain;
  records: DomainRecord[];
  updateRecords: () => void;
  handleUpdateTags: (tagList: string[]) => Promise<Domain>;
}

type CombinedProps = Props & StyleProps;

const DomainRecordsWrapper: React.FC<CombinedProps> = (props) => {
  const { domain, records, updateRecords, handleUpdateTags, classes } = props;
  const hookClasses = useStyles();
  const history = useHistory();
  const { mutateAsync: updateDomain } = useUpdateDomainMutation();

  return (
    <Grid container className={hookClasses.root}>
      <Grid item xs={12} className={hookClasses.main}>
        <DomainRecords
          domain={domain}
          updateDomain={updateDomain}
          domainRecords={records}
          updateRecords={updateRecords}
        />
      </Grid>
      <Grid
        item
        xs={12}
        className={hookClasses.tagsSection}
        id="domains-tag-section"
      >
        <Paper className={classes.summarySection}>
          <Typography variant="h3" className={classes.title} data-qa-title>
            Tags
          </Typography>
          <TagsPanel tags={domain.tags} updateTags={handleUpdateTags} />
        </Paper>
        <div className={hookClasses.delete}>
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
