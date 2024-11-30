const control = (res) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  if (token && user && res) {
    return true;
  }
  return false;
};

export { control };
