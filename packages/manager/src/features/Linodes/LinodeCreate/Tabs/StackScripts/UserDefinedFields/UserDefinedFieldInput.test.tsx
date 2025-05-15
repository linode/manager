import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { UserDefinedFieldInput } from './UserDefinedFieldInput';

import type { UserDefinedField } from '@linode/api-v4';

describe('UserDefinedFieldInput', () => {
  it('should render a TextField for a required UDF', () => {
    const udf: UserDefinedField = {
      label: 'Username',
      name: 'username',
    };

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <UserDefinedFieldInput userDefinedField={udf} />,
    });

    expect(getByLabelText('Username (required)')).toBeVisible();
  });

  it('should render a TextField for an optional UDF', () => {
    const udf: UserDefinedField = {
      default: 'admin',
      label: 'Username',
      name: 'username',
    };

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <UserDefinedFieldInput userDefinedField={udf} />,
    });

    expect(getByLabelText('Username')).toBeVisible();
  });

  it('should render helper text', () => {
    const udf: UserDefinedField = {
      example: 'This is a username',
      label: 'Username',
      name: 'username',
    };

    const { getByText } = renderWithThemeAndHookFormContext({
      component: <UserDefinedFieldInput userDefinedField={udf} />,
    });

    expect(getByText('This is a username')).toBeVisible();
  });

  it('should render a radio when oneOf is defined with 4 or less items', () => {
    const udf: UserDefinedField = {
      label: 'Protocol',
      name: 'protocol',
      oneof: 'tcp,http,imap,ftp',
    };

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <UserDefinedFieldInput userDefinedField={udf} />,
    });

    expect(getByLabelText('tcp')).toHaveRole('radio');
    expect(getByLabelText('http')).toHaveRole('radio');
    expect(getByLabelText('imap')).toHaveRole('radio');
    expect(getByLabelText('ftp')).toHaveRole('radio');
  });

  it('should render a select when oneOf is defined with > 4 items', async () => {
    const udf: UserDefinedField = {
      default: 'tcp',
      label: 'Protocol',
      name: 'protocol',
      oneof: 'tcp,http,imap,ftp,telnet',
    };

    const { getByLabelText, getByText } = renderWithThemeAndHookFormContext({
      component: <UserDefinedFieldInput userDefinedField={udf} />,
    });

    const select = getByLabelText('Protocol');

    await userEvent.click(select);

    expect(getByText('tcp')).toBeVisible();
    expect(getByText('http')).toBeVisible();
    expect(getByText('imap')).toBeVisible();
    expect(getByText('ftp')).toBeVisible();
    expect(getByText('telnet')).toBeVisible();
  });

  it('should render a multi-select when manyOf is defined', async () => {
    const udf: UserDefinedField = {
      default: 'tcp',
      label: 'Protocol',
      manyof: 'tcp,http,imap,ftp,telnet',
      name: 'protocol',
    };

    const { getByLabelText, getByText } = renderWithThemeAndHookFormContext({
      component: <UserDefinedFieldInput userDefinedField={udf} />,
    });

    const select = getByLabelText('Protocol');

    await userEvent.click(select);

    expect(getByText('tcp')).toBeVisible();
    expect(getByText('http')).toBeVisible();
    expect(getByText('imap')).toBeVisible();
    expect(getByText('ftp')).toBeVisible();
    expect(getByText('telnet')).toBeVisible();
  });
});
