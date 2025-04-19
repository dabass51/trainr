declare module 'fit-file-parser' {
  export class FitParser {
    constructor(options?: {
      force?: boolean;
      speedUnit?: string;
      lengthUnit?: string;
      temperatureUnit?: string;
      elapsedRecordField?: boolean;
      mode?: string;
    });

    parse(buffer: Buffer, callback: (error: Error | null, data: any) => void): void;
  }
} 