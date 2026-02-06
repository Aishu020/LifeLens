function isEmail(value) {
  return /.+@.+\..+/.test(value);
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => !body[field]);
  return missing;
}

module.exports = { isEmail, requireFields };

