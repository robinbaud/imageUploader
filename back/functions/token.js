import jwt from "jsonwebtoken";

export function getUserId(request) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice(7);

  try {
    const decodedToken = jwt.verify(
      token,
      "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF"
    );
    if (!decodedToken.userId) {
      return false;
    }
    return decodedToken.userId;
  } catch (e) {
    return false;
  }
}
