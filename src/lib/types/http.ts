export type Errors<T> = { [P in keyof T]?: string[] };

export type SuccessResponse<U> = {
    success: true;
    data: U;
};

export type ErrorResponse<T> = {
    success: false;
    errors: Errors<T>;
};

export type ResponseMessage<T, U> = SuccessResponse<U> | ErrorResponse<T>;
