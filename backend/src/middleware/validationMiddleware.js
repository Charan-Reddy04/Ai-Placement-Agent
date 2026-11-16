export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.shape && (schema.shape.body || schema.shape.query || schema.shape.params)) {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
    } else {
      req.body = schema.parse(req.body);
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: error.errors
        ? error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          }))
        : error.message,
    });
  }
};

export default validate;
