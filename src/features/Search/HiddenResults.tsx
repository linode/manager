import * as React from 'react';
import { compose, withStateHandlers } from 'recompose';

import Button from 'src/components/Button';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import { Item } from 'src/components/EnhancedSelect/Select';
import ResultRow from './ResultRow';


type ClassNames = 'root' | 'button';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  button: {
    marginTop: theme.spacing.unit
  },
});

interface Props {
  results: Item[];
  redirect: (path: string) => void;
}

interface HandlerProps {
  showMore: boolean;
  toggle: () => void;
}

type CombinedProps = Props & HandlerProps & WithStyles<ClassNames>;

const HiddenResults: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, redirect, results, showMore, toggle } = props;
  return (
    <React.Fragment>
        {showMore &&
          results.map((result, idx: number) =>
            <ResultRow key={idx} result={result} redirect={redirect} data-qa-result-row />)
        }
        <Button
          type="primary"
          onClick={toggle}
          className={classes.button}
        >
          {showMore ? "Show Less" : "Show More"}
        </Button>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const handlers = withStateHandlers(
  { showMore: false },
  {
    toggle: ({ showMore }) => () => ({ showMore: !showMore})
  }
)

const enhanced = compose<CombinedProps,Props>(
  styled,
  handlers,
)(HiddenResults);

export default enhanced;
