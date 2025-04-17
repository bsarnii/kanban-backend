export type JwtAuthTokenPayload = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
};
