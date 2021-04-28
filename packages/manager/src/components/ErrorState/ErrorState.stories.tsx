import * as React from 'react';
import ErrorState from './ErrorState';

export default {
  title: 'Error Display',
};

export const WithText = () => <ErrorState errorText="An error has occurred." />;

WithText.story = {
  name: 'with text',
};
