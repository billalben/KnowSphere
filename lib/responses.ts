import { tApiResponse } from "@/types/api";

export function successResponse<T>(
  message = "Success",
  data: T,
): tApiResponse<T> {
  return {
    status: "success",
    message,
    data,
  };
}

export function errorResponse<T>(message: string, data: T): tApiResponse<T> {
  return {
    status: "error",
    message,
    data,
  };
}
