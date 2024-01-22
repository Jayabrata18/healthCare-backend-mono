class ErrorHandler extends Error {
    statusCode: Number;
    message: string;
    constructor(statusCode: any, message: any) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
}
export default ErrorHandler;