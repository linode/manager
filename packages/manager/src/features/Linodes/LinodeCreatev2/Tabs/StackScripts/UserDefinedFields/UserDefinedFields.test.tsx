import React from 'react';

import { stackScriptFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { UserDefinedFields } from './UserDefinedFields';

import type { CreateLinodeRequest } from '@linode/api-v4';

describe('UserDefinedFields', () => {
  it('should render UDFs for the selected StackScript', async () => {
    const stackscript = stackScriptFactory.build({
      user_defined_fields: [
        {
          label: 'Server Username',
          name: 'username',
        },
        {
          label: 'Server Password',
          name: 'password',
        },
        {
          label: 'Protocol',
          name: 'protocol',
          oneof: 'tcp',
        },
        {
          label: 'User Type',
          manyof: 'admin,mod,normal',
          name: 'user_type',
        },
        {
          default: 'password123',
          label: 'Admin Password',
          name: 'admin_password',
        },
      ],
    });

    server.use(
      http.get('*/linode/stackscripts/:id', () => {
        return HttpResponse.json(stackscript);
      })
    );

    const {
      findByLabelText,
    } = renderWithThemeAndHookFormContext<CreateLinodeRequest>({
      component: <UserDefinedFields />,
      useFormOptions: {
        defaultValues: { stackscript_id: stackscript.id },
      },
    });

    for (const udf of stackscript.user_defined_fields) {
      // eslint-disable-next-line no-await-in-loop
      await findByLabelText(udf.label, { exact: false });
    }
  });
});
