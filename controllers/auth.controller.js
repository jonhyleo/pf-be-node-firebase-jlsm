import { login as authenticate } from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const result = await authenticate(req.body?.email, req.body?.password);
  res.status(200).json({
    success: true,
    tokenType: 'Bearer',
    token: result.token,
    user: result.user,
  });
});
