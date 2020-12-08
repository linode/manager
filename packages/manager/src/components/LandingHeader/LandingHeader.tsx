import * as React from 'react';
import Grid from 'src/components/Grid';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import EntityHeader, {
  HeaderProps
} from 'src/components/EntityHeader/EntityHeader';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    borderRadius: 3,
    height: 34,
    padding: 0
  },
  hideOnMobile: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  }
}));

interface Props extends Omit<HeaderProps, 'actions'> {
  extraActions?: JSX.Element;
  alwaysShowActions?: boolean;
  body?: JSX.Element;
  docsLink?: string;
  onAddNew?: () => void;
  entity: string;
  createButtonWidth?: number;
  createButtonText?: string;
}

/**
 * This component is essentially a variant of the more abstract EntityHeader
 * component, included as its own component because it will be used in
 * essentially this form across all entity landing pages.
 */

export const LandingHeader: React.FC<Props> = props => {
  const classes = useStyles();

  const {
    docsLink,
    onAddNew,
    entity,
    extraActions,
    alwaysShowActions,
    createButtonWidth,
    createButtonText
  } = props;

  const defaultCreateButtonWidth = 152;

  const startsWithVowel = /^[aeiou]/i.test(entity);

  const actions = React.useMemo(
    () => (
      <Grid
        container
        direction="row"
        item
        alignItems="center"
        justify="flex-end"
      >
        {extraActions && (
          <Grid item className={alwaysShowActions ? '' : classes.hideOnMobile}>
            {extraActions}
          </Grid>
        )}

        {onAddNew && (
          <Grid item>
            <Button
              buttonType="primary"
              className={classes.button}
              onClick={onAddNew}
              style={{ width: createButtonWidth ?? defaultCreateButtonWidth }}
            >
              {createButtonText
                ? createButtonText
                : `Create ${startsWithVowel ? 'an' : 'a'} ${entity}`}
            </Button>
          </Grid>
        )}
      </Grid>
    ),
    [
      docsLink,
      entity,
      onAddNew,
      classes.button,
      extraActions,
      createButtonWidth,
      startsWithVowel,
      createButtonText
    ]
  );

  return (
    <EntityHeader isLanding actions={actions} docsLink={docsLink} {...props} />
  );
};

export default LandingHeader;
