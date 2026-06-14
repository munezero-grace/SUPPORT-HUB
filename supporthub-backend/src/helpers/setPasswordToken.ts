import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export const SET_PASSWORD_PURPOSE = "set-password";

export interface SetPasswordTokenPayload extends jwt.JwtPayload {
  userId: string;
  purpose: string;
}

export const generateSetPasswordToken = (userId: string): string => {
  return jwt.sign(
    { userId, purpose: SET_PASSWORD_PURPOSE },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

export const verifySetPasswordToken = (token: string): SetPasswordTokenPayload => {
  return jwt.verify(token, JWT_SECRET as string) as SetPasswordTokenPayload;
};
