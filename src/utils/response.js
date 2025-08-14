const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    status: "success",
    message,
  };

  if (data !== null) {
    response.result = data;
  }
  return res.status(statusCode).json(response);
};

const sendErrorResponse = (res, statusCode, message, err = null) => {
  const response = {
    status: "fail",
    message,
  };

  if (err) {
    response.error = err;
  }
  return res.status(statusCode).json(response);
};

export { sendSuccessResponse, sendErrorResponse };
