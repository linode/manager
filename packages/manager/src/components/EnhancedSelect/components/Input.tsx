import * as React from 'react';
import { components as reactSelectComponents, InputProps } from 'react-select';

const Input: React.FC<InputProps> = (props) => {
  // React-Select uses the AutoSizeInput component, which dangerously injects
  // HTML to apply a CSS class for Edge. See: https://github.com/JedWatson/react-input-autosize/blob/0aa6225fb4ae4e30d51a23f75b36b15e709efdd0/src/AutosizeInput.js#L144
  // Naturally, we want to disable this with the `injectStyles` option.
  // React-Select will pass whatever props we give <Input /> down to
  // <AutoSizeInput />, so we can inject the prop here. (We just have to cheat TypeScript).
  const finalProps: any = { ...props, injectStyles: false };

  return <reactSelectComponents.Input {...finalProps} />;
};

export default Input;
