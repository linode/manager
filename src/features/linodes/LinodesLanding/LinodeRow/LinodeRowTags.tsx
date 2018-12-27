import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';
import Tag from 'src/components/Tag';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  tags: string[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowTags: React.StatelessComponent<CombinedProps> = (props) => {
  const { tags } = props;
  return (
    <Paper>
      {tags.map((tag, idx) =>
        <Tag
          key={`linode-row-tag-item-${idx}`}
          colorVariant='lightBlue'
          label={tag}
        />
      )}
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(LinodeRowTags);
