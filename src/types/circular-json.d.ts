/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'circular-json' {
  export function stringify(obj: any): string;
  export function parse(str: string): any;
  const circularJson = {
    stringify,
    parse,
  };
  export default circularJson;
} 