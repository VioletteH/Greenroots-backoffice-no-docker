import { Request, Response, NextFunction } from "express";

export function isLogged(req: Request, res: Response, next: NextFunction) {
  const userCookie = req.cookies?.userbo;

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      res.locals.currentUser = user;
      return next();
    } catch (e) {
      res.locals.currentUser = null;
    }
  }

  res.locals.currentUser = null;
  return next();
};
