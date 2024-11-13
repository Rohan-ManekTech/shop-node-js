// helpers/responseModel.js
module.exports = {
    success: (res, data = {}, message = "Request successful", statusCode = 200) => {
        return res.status(statusCode).json({
            status: true,  // Indicates success
            message,
            data,
        });
    },

    error: (res, message = "Something went wrong", statusCode = 500, data = {}) => {
        return res.status(statusCode).json({
            status: false,  // Indicates failure
            message,
            data,
        });
    },
};