import { v4 as uuidv4 } from 'uuid';

// Añade cookie anon_id si no existe
export const setAnonId = (req, res, next) => {
  const cookieName = 'anon_id';
  if (!req.cookies?.[cookieName]) {
    const id = uuidv4();
    res.cookie(cookieName, id, { 
      maxAge: 1000 * 60 * 60 * 24 * 365, 
      httpOnly: true 
    });
    req.cookies = { 
      ...req.cookies, 
      [cookieName]: id 
    };
  }
  next();
};
