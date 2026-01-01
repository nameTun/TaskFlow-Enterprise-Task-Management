// Hàm bọc (Higher Order Function)
 const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
export default asyncHandler;
