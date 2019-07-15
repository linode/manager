import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';
import Tag from 'src/components/Tag';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: 'transparent'
    }
  });

interface Props {
  tags: string[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Tags: React.StatelessComponent<CombinedProps> = props => {
  const { tags, classes } = props;
  return (
    <Paper className={classes.root}>
      {tags.map((tag, idx) => (
        <Tag
          key={`linode-row-tag-item-${idx}`}
          colorVariant="lightBlue"
          label={tag}
        />
      ))}
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(Tags);
