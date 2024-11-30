export const errorHandler = (error) => {
  const { request, response } = error;
  if (response) {
    const { data, status } = response;
    return {
      data,
      status,
    };
  } else if (request) {
    return {
      message: "Server Server time out error!",
      status: 503,
    };
  } else {
    return { message: "Opps! Something went wrong while setting up request." };
  }
};
