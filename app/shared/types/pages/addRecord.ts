export type AddRecordResponse = {
  message: string;
  pk?: string | number;
  validation_error?: Record<string, string>;
};
