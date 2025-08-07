import axios from "axios";
import { Request, Response } from "express";
import { sanitizeInput } from "../utils/sanitize";
import { catchAsync } from "../utils/catchAsync";

const API_URL = process.env.API_BASE_URL;

const authController = {

    loginView: async (req: Request, res: Response) => {
        res.render('auth/login');
    },

    loginPost: catchAsync(async (req: Request, res: Response) => {
        
        const sanitizedBody = sanitizeInput(req.body);
        const { email, password } = sanitizedBody;

        const response = await axios.post(`${API_URL}/login/`, { email, password });
        const { token, user } = response.data;

        if (user.role !== 'admin') {
            return res.status(403).render('auth/login', {
                email,
                error: 'Accès réservé aux administrateurs.',
            });
        }

        res.cookie('tokenbo', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie('userbo', JSON.stringify(user), {
            httpOnly: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.redirect('/');
    }),

    logout: (req: Request, res: Response) => {
        res.clearCookie('tokenbo');
        res.clearCookie('userbo');
        return res.redirect('/login');
    }
};

export default authController;