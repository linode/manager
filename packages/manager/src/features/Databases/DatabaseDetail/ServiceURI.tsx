import { toast } from '@akamai/cds-components/notification-toast';
import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import { Alias, Spacing } from '@akamai/cds-tokens';
import { Alias as DarkThemeAlias } from '@akamai/cds-tokens/themes/dark';
import { useDatabaseCredentialsQuery } from '@linode/queries';
import { styled } from '@mui/material';
import copy from 'copy-to-clipboard';
import React, { useState } from 'react';

import { Code } from 'src/components/Code/Code';
import {
  CLUSTER_PROVISIONING_TEXT,
  CREDENTIALS_ERROR_TEXT,
  DISABLE_CREDENTIAL_STATES,
  DISABLED_PASSWORD_BUTTON_TEXT,
} from 'src/features/Databases/constants';

import { CopyTooltip } from '../shared/CopyTooltip/CopyTooltip';

import type { Database, DatabaseCredentials } from '@linode/api-v4';

interface ServiceURIProps {
  database: Database;
  isGeneralServiceURI?: boolean;
  showPrivateVPC?: boolean;
}

const ENGINE_SSLMODE_MAP = {
  mysql: '/defaultdb?ssl-mode=REQUIRED',
  postgres: '/defaultdb?sslmode=require',
  valkey: '',
};

const ENGINE_TEXT_MAP = {
  mysql: 'mysql',
  postgres: 'postgres',
  valkey: 'rediss', // rediss is needed for backwards compatibility
};

export const ServiceURI = (props: ServiceURIProps) => {
  const {
    database,
    isGeneralServiceURI = false,
    showPrivateVPC = false,
  } = props;

  const [hidePassword, setHidePassword] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const engine =
    database.engine === 'postgresql' ? 'postgres' : database.engine;
  const generalSslmode =
    ENGINE_SSLMODE_MAP[engine] ?? '/defaultdb?sslmode=require';

  const {
    data: credentials,
    error: credentialsError,
    isLoading: credentialsLoading,
    isFetching: credentialsFetching,
    refetch: getDatabaseCredentials,
  } = useDatabaseCredentialsQuery(database.engine, database.id, !hidePassword);

  const hasVPC = Boolean(database?.private_network?.vpc_id);
  const hasPublicVPC = hasVPC && database.private_network?.public_access;
  // If there is a VPC, use VPC public access unless we want to explicitly show private access, otherwise default to public
  const publicAccess =
    hasPublicVPC && showPrivateVPC
      ? false
      : hasVPC
        ? database.private_network?.public_access
        : true;

  const primaryHost = database.hosts?.endpoints.find(
    (endpoint) =>
      endpoint.role === 'primary' && endpoint.public_access === publicAccess
  );
  const primaryConnectionPoolHost = database.hosts?.endpoints.find(
    (endpoint) =>
      endpoint.role === 'primary-connection-pool' &&
      endpoint.public_access === publicAccess
  );

  const handleCopy = async () => {
    if (!credentials) {
      try {
        setIsCopying(true);
        const { data } = await getDatabaseCredentials();
        if (data) {
          // copy with revealed credentials
          copy(getServiceURIText(data, isGeneralServiceURI));
        } else {
          toast.open({ text: CREDENTIALS_ERROR_TEXT, type: 'error' });
        }
        setIsCopying(false);
      } catch {
        setIsCopying(false);
        toast.open({ text: CREDENTIALS_ERROR_TEXT, type: 'error' });
      }
    }
  };

  const getServiceURIText = (
    credentials: DatabaseCredentials | undefined,
    isGeneralServiceURI?: boolean
  ) => {
    if (isGeneralServiceURI) {
      return `${ENGINE_TEXT_MAP[engine]}://${credentials?.username}:${credentials?.password}@${primaryHost?.address}:${primaryHost?.port}${generalSslmode}`;
    }
    return `postgres://${credentials?.username}:${credentials?.password}@${primaryConnectionPoolHost?.address}:${primaryConnectionPoolHost?.port}/{connection pool label}?sslmode=require`;
  };

  // hide loading state if the user clicks on the copy icon
  const showBtnLoading =
    !hidePassword && !isCopying && (credentialsLoading || credentialsFetching);

  const disablePasswordBtn = DISABLE_CREDENTIAL_STATES.includes(
    database.status
  );

  const disabledPasswordTooltipText =
    database.status === 'provisioning'
      ? CLUSTER_PROVISIONING_TEXT
      : DISABLED_PASSWORD_BUTTON_TEXT;

  React.useEffect(() => {
    if (!hidePassword && credentialsError) {
      setHidePassword(true);
      toast.open({ text: CREDENTIALS_ERROR_TEXT, type: 'error' });
    }
  }, [credentialsError, hidePassword]);

  const renderPassword = () => {
    if (hidePassword || credentialsError || !credentials) {
      return (
        <Tooltip
          disabled={!disablePasswordBtn}
          style={{ whiteSpace: 'normal' }}
          tooltipText={disabledPasswordTooltipText}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              disabled={disablePasswordBtn}
              onClick={() => {
                getDatabaseCredentials();
                setHidePassword(false);
              }}
              processing={showBtnLoading}
              style={{
                padding: 0,
                position: 'relative',
                display: 'flex',
              }}
              variant="link"
            >
              {`{Click To Reveal Password}`}
              {disablePasswordBtn ? (
                <Icon icon="info-outline" size="m" />
              ) : null}
            </Button>
          </div>
        </Tooltip>
      );
    }

    return `${credentials?.username}:${credentials?.password}`;
  };

  if (
    (isGeneralServiceURI && !primaryHost) ||
    (engine === 'postgres' && !primaryConnectionPoolHost)
  ) {
    return (
      <div style={{ display: 'contents' }}>
        <div
          data-testid="service-uri"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: 0,
            whiteSpace: 'pre',
          }}
        >
          <span style={{ fontStyle: 'italic' }}>
            Your Service URI will appear here once it is available.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'contents' }}>
      <div
        data-testid="service-uri"
        style={{ display: 'inline', overflowX: 'scroll', whiteSpace: 'nowrap' }}
      >
        {ENGINE_TEXT_MAP[engine]}://
        {renderPassword()}
        {isGeneralServiceURI ? (
          <>
            @{primaryHost?.address}:{`${primaryHost?.port}${generalSslmode}`}
          </>
        ) : (
          <>
            @{primaryConnectionPoolHost?.address}:
            {primaryConnectionPoolHost?.port}/
            <StyledCode>{'{connection pool label}'}</StyledCode>
            ?sslmode=require
          </>
        )}
      </div>
      {isCopying ? (
        <div
          style={{
            paddingLeft: Spacing.S8,
            paddingRight: Spacing.S8,
            position: 'relative',
            top: Spacing.S0,
            backgroundColor: `light-dark(${Alias.Background.Normal}, ${DarkThemeAlias.Background.Normal})`,
          }}
        >
          <Icon icon="spinner-gradient" size="s" />
        </div>
      ) : (
        <div style={{ display: 'contents' }}>
          <CopyTooltip
            disabled={disablePasswordBtn}
            disabledReason={disabledPasswordTooltipText}
            onClickCallback={handleCopy}
            text={getServiceURIText(credentials, isGeneralServiceURI)}
          />
        </div>
      )}
      {hasPublicVPC && showPrivateVPC && (
        <div style={{ display: 'contents' }}>
          <Tooltip
            style={{ marginLeft: Spacing.S4 }}
            tooltipPlacement="bottom"
            tooltipText="Private endpoints are resolvable only for resources within the VPC Subnet. Public endpoints are resolvable outside the VPC."
          >
            <Icon icon="info-outline" size="m" />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export const StyledCode = styled(Code, {
  label: 'StyledCode',
})(() => ({
  margin: 0,
}));
