import * as React from 'react';
const PasswordInput = React.lazy(() => import('src/components/PasswordInput'));

const Input: React.FC<{}> = (props) => {
  const [value, setValue] = React.useState<string>('');
  return (
    <>
      <React.Suspense fallback={() => null}>
        <PasswordInput
          label="Password"
          value={value}
          onChange={(e: any) => setValue(e.target.value)}
        />
      </React.Suspense>
      <p>Some text underneath</p>
    </>
  );
};

export default {
  title: 'Password Input',
};

export const Example = () => <Input />;
