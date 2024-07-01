import * as React from 'react';

export type DevToolsSelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

/**
 * Thin wrapper around native `<select />` element to facilitate theming.
 */
export const DevToolSelect = (props: DevToolsSelectProps) => {
  const { style } = props;
  const propsWithoutStyles = {
    ...props,
    style: undefined,
  };

  return (
    <div className="dev-tools__select" style={style}>
      <select {...propsWithoutStyles}>{props.children}</select>
    </div>
  );
};
