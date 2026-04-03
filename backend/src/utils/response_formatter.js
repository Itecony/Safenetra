export const success_response = (
    res,
    { status_code = 200, message = "Success", data = null, meta = null }
) => {
    return res.status(status_code).json({
        success: true,
        status_code,
        message,
        data,
        meta
    });
};

export const error_response = (
    res,
    {
        status_code = 500,
        message = "Something went wrong",
        error_code = "INTERNAL_ERROR",
        details = null
    }
) => {
    return res.status(status_code).json({
        success: false,
        status_code,
        message,
        error: {
            code: error_code,
            details
        }
    });
};
