import { Grant } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import { Linode } from '@linode/api-v4/lib/linodes';
import {
  StackScript,
  UserDefinedField,
  getStackScript,
} from '@linode/api-v4/lib/stackscripts';
import { Filter, Params, ResourcePage } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';
import { RenderGuard, RenderGuardProps } from 'src/components/RenderGuard';
import { Typography } from 'src/components/Typography';
import {
  WithProfileProps,
  withProfile,
} from 'src/containers/profile.container';
import { formatDate } from 'src/utilities/formatDate';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';
import { truncate } from 'src/utilities/truncate';

import { StackScriptTableHead } from '../Partials/StackScriptTableHead';
import SelectStackScriptPanelContent from './SelectStackScriptPanelContent';
import StackScriptSelectionRow from './StackScriptSelectionRow';

import { StyledLinkDiv, StyledPanelPaper, StyledSelectingPaper, StyledTable } from './SelectStackScriptPanel.styles';

export interface ExtendedLinode extends Linode {
  heading: string;
  subHeadings: string[];
}

interface Props extends RenderGuardProps {
  category: string;
  disabled?: boolean;
  error?: string;
  header: string;
  isOnCreate?: boolean;
  onSelect: (
    id: number,
    label: string,
    username: string,
    images: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  publicImages: Record<string, Image>;
  request: (
    username: string,
    params?: Params,
    filter?: Filter,
    stackScriptGrants?: Grant[]
  ) => Promise<ResourcePage<StackScript>>;
  resetSelectedStackScript: () => void;
  selectedId: number | undefined;
  selectedUsername?: string;
}

type CombinedProps = Props &
  RenderGuardProps &
  WithProfileProps;

interface State {
  stackScript?: StackScript;
  stackScriptError: boolean;
  stackScriptLoading: boolean;
}

class SelectStackScriptPanel extends React.Component<CombinedProps, State> {
  componentDidMount() {
    const selected = +getQueryParamFromQueryString(
      location.search,
      'stackScriptID'
    );
    /** '' converted to a number is 0 */
    if (!isNaN(selected) && selected !== 0) {
      this.setState({ stackScriptLoading: true });
      getStackScript(selected)
        .then((stackScript) => {
          this.setState({ stackScript, stackScriptLoading: false });
          this.props.onSelect(
            stackScript.id,
            stackScript.label,
            stackScript.username,
            stackScript.images,
            stackScript.user_defined_fields
          );
        })
        .catch((_) => {
          this.setState({ stackScriptError: true, stackScriptLoading: false });
        });
    }
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const {
      category,
      error,
      profile,
      request,
      selectedId,
    } = this.props;
    const { stackScript, stackScriptError, stackScriptLoading } = this.state;

    if (selectedId) {
      if (stackScriptLoading) {
        return <CircleProgress />;
      }
      if (stackScript) {
        return (
          <React.Fragment>
            <StyledTable
              aria-label="List of StackScripts"
              data-qa-select-stackscript
              noOverflow={true}
            >
              <StackScriptTableHead
                currentFilterType={null}
                isSelecting={true}
              />
              <tbody>
                <StackScriptSelectionRow
                  updated={formatDate(stackScript.updated, {
                    displayTime: false,
                    timezone: profile.data?.timezone,
                  })}
                  checked={selectedId === stackScript.id}
                  deploymentsActive={stackScript.deployments_active}
                  description={truncate(stackScript.description, 100)}
                  disabledCheckedSelect
                  key={stackScript.id}
                  label={stackScript.label}
                  stackScriptID={stackScript.id}
                  stackScriptUsername={stackScript.username}
                  updateFor={[selectedId === stackScript.id]}
                />
              </tbody>
            </StyledTable>
            <StyledLinkDiv>
              <Button buttonType="secondary" onClick={this.resetStackScript}>
                Choose another StackScript
              </Button>
            </StyledLinkDiv>
          </React.Fragment>
        );
      }
    }

    return (
      <StyledPanelPaper>
        <Box padding={0}>
          {error && (
            <Notice
              spacingBottom={0}
              spacingTop={8}
              text={error}
              variant="error"
            />
          )}
          {stackScriptError && (
            <Typography variant="body1">
              An error occurred while loading the selected StackScript.
            </Typography>
          )}
          <StyledSelectingPaper>
            <SelectStackScriptPanelContent
              category={category}
              currentUser={profile.data?.username || ''}
              disabled={this.props.disabled}
              isOnCreate={this.props.isOnCreate}
              key={category + '-tab'}
              onSelect={this.props.onSelect}
              publicImages={this.props.publicImages}
              request={request}
              resetStackScriptSelection={this.props.resetSelectedStackScript}
            />
          </StyledSelectingPaper>
        </Box>
      </StyledPanelPaper>
    );
  }

  mounted: boolean = false;

  resetStackScript = () => {
    this.setState({ stackScript: undefined, stackScriptLoading: false });
  };

  state: State = {
    stackScriptError: false,
    stackScriptLoading: false,
  };
}

export default compose<CombinedProps, Props>(
  RenderGuard,
  withProfile
)(SelectStackScriptPanel);
