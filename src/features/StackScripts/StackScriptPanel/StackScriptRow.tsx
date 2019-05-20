import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import { withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import StackScriptsActionMenu from 'src/features/StackScripts/StackScriptPanel/StackScriptActionMenu';
import { StackScriptCategory } from 'src/features/StackScripts/stackScriptUtils';
import {
  ClassNames,
  displayTagsAndShowMore,
  styles
} from '../StackScriptRowHelpers';

export interface Props {
  label: string;
  description: string;
  images: string[];
  deploymentsActive: number;
  updated: string;
  stackScriptID: number;
  stackScriptUsername: string;
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  canModify: boolean;
  canAddLinodes: boolean;
  isPublic: boolean;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  // change until we're actually using it.
  category: StackScriptCategory | string;
}

export type CombinedProps = Props & WithStyles<ClassNames> & RenderGuardProps;

export class StackScriptRow extends React.Component<CombinedProps, {}> {
  render() {
    const {
      classes,
      label,
      description,
      images,
      deploymentsActive,
      updated,
      stackScriptID,
      stackScriptUsername,
      triggerDelete,
      triggerMakePublic,
      canModify,
      isPublic,
      category,
      canAddLinodes
    } = this.props;

    const renderLabel = () => {
      return (
        <React.Fragment>
          <Link to={`/stackscripts/${stackScriptID}`}>
            <Typography variant="h3" className={classes.libTitle}>
              {stackScriptUsername && (
                <span
                  className={`${classes.libRadioLabel} ${
                    classes.stackScriptUsername
                  }`}
                >
                  {stackScriptUsername} /&nbsp;
                </span>
              )}
              <span className={classes.libRadioLabel}>{label}</span>
            </Typography>
          </Link>
          <Typography variant="body1" className={classes.libDescription}>
            {description}
          </Typography>
        </React.Fragment>
      );
    };

    return (
      <React.Fragment>
        <TableRow data-qa-table-row={label}>
          <TableCell
            className={classes.stackScriptCell}
            data-qa-stackscript-title
            parentColumn="StackScript"
          >
            {renderLabel()}
          </TableCell>
          <TableCell parentColumn="Active Deploys">
            <Typography data-qa-stackscript-deploys>
              {deploymentsActive}
            </Typography>
          </TableCell>
          <TableCell parentColumn="Last Revision">
            <Typography data-qa-stackscript-revision>{updated}</Typography>
          </TableCell>
          <TableCell
            data-qa-stackscript-images
            parentColumn="Compatible Images"
          >
            {displayTagsAndShowMore(images)}
          </TableCell>
          <TableCell>
            <StackScriptsActionMenu
              stackScriptID={stackScriptID}
              stackScriptUsername={stackScriptUsername}
              stackScriptLabel={label}
              triggerDelete={triggerDelete}
              triggerMakePublic={triggerMakePublic}
              canModify={canModify}
              canAddLinodes={canAddLinodes}
              isPublic={isPublic}
              category={category}
            />
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
}

export default recompose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  withStyles(styles)
)(StackScriptRow);
