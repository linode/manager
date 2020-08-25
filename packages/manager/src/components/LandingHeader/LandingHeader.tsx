import * as React from 'react';
import Grid from 'src/components/Grid';
import Button from 'src/components/Button';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import EntityHeader, {
  HeaderProps
} from 'src/components/EntityHeader/EntityHeader';
import Hidden from '../core/Hidden';

const useStyles = makeStyles(() => ({
  button: {
    borderRadius: 3,
    height: 34,
    padding: 0
  }
}));

interface Props extends Omit<HeaderProps, 'actions'> {
  extraActions?: JSX.Element;
  body?: JSX.Element;
  docsLink: string;
  onAddNew?: () => void;
  entity: string;
  createButtonWidth?: number;
}

/**
 * This component is essentially a variant of the more abstract EntityHeader
 * component, included as its own component because it will be used in
 * essentially this form across all entity landing pages.
 */

export const LandingHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { docsLink, onAddNew, entity, extraActions, createButtonWidth } = props;

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
          <Hidden smDown>
            <Grid item>{extraActions}</Grid>
          </Hidden>
        )}

        {onAddNew && (
          <Grid item>
            <Button
              buttonType="primary"
              className={classes.button}
              onClick={onAddNew}
              style={{ width: createButtonWidth ?? defaultCreateButtonWidth }}
            >
              Create {startsWithVowel ? `an` : `a`} {entity}...
            </Button>
          </Grid>
        )}
        {docsLink && (
          <DocumentationButton href={docsLink} hideText={matchesSmDown} />
        )}
      </Grid>
    ),
    [
      docsLink,
      entity,
      onAddNew,
      classes.button,
      extraActions,
      matchesSmDown,
      createButtonWidth
    ]
  );

  return <EntityHeader isLanding actions={actions} {...props} />;
};

export default LandingHeader;
