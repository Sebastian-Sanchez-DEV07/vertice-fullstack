const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(schema) {
  return (req, res, next) => {
    const data = req.body || {};
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const isEmpty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "");

      if (rules.required && isEmpty) {
        errors.push(`${field} es obligatorio`);
        continue;
      }

      if (isEmpty) continue;

      if (rules.type === "string" && typeof value !== "string") {
        errors.push(`${field} debe ser texto`);
        continue;
      }

      if (rules.type === "number" && !Number.isFinite(Number(value))) {
        errors.push(`${field} debe ser numerico`);
        continue;
      }

      if (rules.type === "number" && Number.isFinite(Number(value))) {
        const number = Number(value);

        if (rules.minValue !== undefined && number < rules.minValue) {
          errors.push(`${field} debe ser mayor o igual a ${rules.minValue}`);
        }

        if (rules.maxValue !== undefined && number > rules.maxValue) {
          errors.push(`${field} debe ser menor o igual a ${rules.maxValue}`);
        }
      }

      if (rules.type === "boolean" && typeof value !== "boolean") {
        errors.push(`${field} debe ser booleano`);
        continue;
      }

      if (typeof value === "string") {
        const text = value.trim();

        if (rules.min && text.length < rules.min) {
          errors.push(`${field} debe tener al menos ${rules.min} caracteres`);
        }

        if (rules.max && text.length > rules.max) {
          errors.push(`${field} no debe superar ${rules.max} caracteres`);
        }

        if (rules.email && !EMAIL_REGEX.test(text)) {
          errors.push(`${field} debe ser un correo valido`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Datos invalidos", errors });
    }

    next();
  };
}

module.exports = validate;
