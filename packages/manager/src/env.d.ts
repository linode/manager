interface ImportMetaEnv {
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg' {
  const src: ComponentClass<any, any>;
  export default src;
}
