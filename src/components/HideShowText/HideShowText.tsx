import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';

import RemoveRedEye from 'material-ui-icons/RemoveRedEye';

type CSSClasses = 'hiddenText' | 'shownText';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  hiddenText: {
  },
  shownText: {
  },
});

interface Props {
  hidden?: Boolean;
  text: string;
  onClick?: () => void;
}

type FinalProps = Props & WithStyles<CSSClasses>;

const HideShowText: React.StatelessComponent<FinalProps> = (props) => {
  const { hidden, classes, text, onClick } = props;

  return (
    <React.Fragment>
      <RemoveRedEye onClick={onClick}/>
      {hidden
        ? <input
            type="password"
            className={classes.hiddenText}
            value={text}
          />
        : <span className={classes.shownText}>
            {text}
          </span>
      }
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(HideShowText);
