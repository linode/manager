import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import Typography from 'src/components/core/Typography';
import formatDate from 'src/utilities/formatDate';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& div': {
      paddingTop: `0px !important`,
      paddingBottom: `0px !important`
    }
  },
  detailsSection: {
    display: 'flex'
  },
  linodeId: {
    paddingRight: 10,
    borderRight: `1px solid ${theme.color.grey6}`
  },
  linodeCreated: {
    paddingLeft: 10
  },
  linodeTags: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
}));

export interface LinodeEntityDetailFooterProps {
  linodeId: number;
  linodeCreated: string;
  linodeTags: string[];
}

export const LinodeEntityDetailFooter: React.FC<LinodeEntityDetailFooterProps> = props => {
  const { linodeId, linodeCreated } = props;

  const classes = useStyles();
  return (
    <Grid container className={classes.root}>
      <Grid item xs={6}>
        <div className={classes.detailsSection}>
          <Typography className={classes.linodeId}>
            Linode ID {linodeId}
          </Typography>
          <Typography className={classes.linodeCreated}>
            Created {formatDate(linodeCreated)}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={6} className={classes.linodeTags}>
        <div>Linode Tags</div>
      </Grid>
    </Grid>
  );
};

export default LinodeEntityDetailFooter;
