/**
 * We set any svg import to be a default export of a React component.
 *
 * We do this because Vite's default is for the type to be a `string`,
 * but we use `vite-plugin-svgr` to allow us to import svgs as components.
 */
declare module '*.svg' {
  const src: ComponentClass<any, any>;
  export default src;
}
