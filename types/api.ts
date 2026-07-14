export type tApiResponse<T> = {
  status: "success" | "error";
  message: string;
  data: T;
};
