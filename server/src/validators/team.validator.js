import Joi from "joi";
import { BadRequestError } from "../core/error.response.js";



const createTeamSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Tên nhóm không được để trống",
    "any.required": "Vui lòng nhập tên nhóm",
  }),
  description: Joi.string().trim().allow("").max(500),
});

const inviteMemberSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Vui lòng nhập email thành viên cần mời",
  }),
});

const validateCreateTeam = (req, res, next) => {
  const { error, value } = createTeamSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) throw new BadRequestError(error.details[0].message);
  req.body = value;
  next();
};

const validateInviteMember = (req, res, next) => {
  const { error, value } = inviteMemberSchema.validate(req.body);
  if (error) throw new BadRequestError(error.details[0].message);
  req.body = value;
  next();
};

export { validateCreateTeam, validateInviteMember };
