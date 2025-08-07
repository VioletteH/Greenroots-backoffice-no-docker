import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userCookie = req.cookies?.userbo;

  if (!userCookie) {
    return res.redirect("/login");
  }

  try {
    const user = JSON.parse(userCookie);

    if (!user || user.role !== "admin") {
      return res.status(403).render("auth/login", {
        error: "Accès interdit : administrateurs uniquement.",
      });
    }

    res.locals.currentUser = user;
    next();
  } catch (error) {
    return res.redirect("/login");
  }
};
