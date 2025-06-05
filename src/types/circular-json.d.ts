declare module 'circular-json' {
  export function stringify(obj: any): string;
  export function parse(str: string): any;
  export default {
    stringify,
    parse,
  };
} 