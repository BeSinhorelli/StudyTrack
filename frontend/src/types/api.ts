export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  code?: string;
  errors?: { field: string; message: string }[];
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;