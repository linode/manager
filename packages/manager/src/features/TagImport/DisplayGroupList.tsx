import { isEmpty } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: theme.bg.tableHeader,
    padding: theme.spacing(2),
  },
  groupBox: {
    marginTop: theme.spacing(3),
  },
  groupItem: {
    margin: theme.spacing(1),
  },
}));

export interface Props {
  entity: 'Linode' | 'Domain';
  groups: string[];
}

export const DisplayGroupList = (props: Props) => {
  const classes = useStyles();
  const { entity, groups } = props;

  if (isEmpty(groups)) {
    return null;
  }

  return (
    <Paper className={classes.root}>
      <Typography variant="h3">{entity} Groups to Import</Typography>
      <div className={classes.groupBox}>
        {groups.map((group: string, idx: number) => (
          <Typography
            key={`${entity}-group-item-${idx}`}
            className={classes.groupItem}
            data-testid="display-group-item"
          >
            - {group}
          </Typography>
        ))}
      </div>
    </Paper>
  );
};

export default DisplayGroupList;
