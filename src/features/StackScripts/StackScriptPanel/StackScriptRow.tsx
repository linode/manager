import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose as recompose } from 'recompose';

import { withStyles, WithStyles } from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableRow from 'src/components/TableRow';
import StackScriptsActionMenu from 'src/features/StackScripts/StackScriptPanel/StackScriptActionMenu';
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
  canDelete: boolean;
  canEdit: boolean;
  isPublic: boolean;
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
      canDelete,
      canEdit,
      isPublic
    } = this.props;

    const renderLabel = () => {
      return (
        <React.Fragment>
          <Link to={`/stackscripts/${stackScriptID}`}>
            <Typography role="header" variant="h3">
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
          <Typography variant="body1">{description}</Typography>
        </React.Fragment>
      );
    };

    return (
      <React.Fragment>
        <TableRow data-qa-table-row={label}>
          <TableCell
            className={classes.stackScriptCell}
            data-qa-stackscript-title
          >
            {renderLabel()}
          </TableCell>
          <TableCell>
            <Typography role="header" variant="h3" data-qa-stackscript-deploys>
              {deploymentsActive}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography role="header" variant="h3" data-qa-stackscript-revision>
              {updated}
            </Typography>
          </TableCell>
          <TableCell
            className={classes.stackScriptCell}
            data-qa-stackscript-images
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
              canDelete={canDelete}
              canEdit={canEdit}
              isPublic={isPublic}
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
