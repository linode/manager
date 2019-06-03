import { isEmpty } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'groupBox' | 'groupItem';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    background: theme.bg.tableHeader,
    padding: theme.spacing(2)
  },
  groupBox: {
    marginTop: theme.spacing(3)
  },
  groupItem: {
    margin: theme.spacing(1)
  }
});

interface Props {
  entity: 'Linode' | 'Domain';
  groups: string[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const DisplayGroupList: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, entity, groups } = props;

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
            data-qa-display-group-item={entity}
          >
            - {group}
          </Typography>
        ))}
      </div>
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(DisplayGroupList);
