import { Request, Response } from 'express';
import { User } from '../types/index';
import { sanitizeInput } from "../utils/sanitize";
import { catchAsync } from '../utils/catchAsync';
import { getAll, getOne, create, update, remove } from '../api/user';

const userController = {

   users: catchAsync(async (req:Request, res:Response): Promise<void> => {

      const limit = 9;
      const page = Number(req.query.page as string) || 1;
      const offset = (page - 1) * limit;

      const { users, total } = await getAll(req, limit, offset, true);
      const totalPages = total ? Math.ceil(total / limit) : 1;

      res.render('user/index', { 
         users,
         currentPage: page,
         totalPages,
         hasNext: page < totalPages,
         hasPrevious: page > 1
      });
   }),

   user: catchAsync(async (req:Request, res:Response) => {
      const id = req.params.id;
      const user: User = await getOne(req, id);
      if (!user) {
         return res.status(404).render('error/404', { message: 'Utilisateur non trouvé' });
      }
      res.render('user/show', { user, error : null });
   }),

   createUserView: (req:Request, res:Response) => {
      res.render('user/new');
   },

   createUser: catchAsync(async (req:Request, res:Response) => {
      const user: User = sanitizeInput(req.body);
      await create(req, user);
      res.redirect('/users');
   }),

   updateUserView: catchAsync(async (req:Request, res:Response) => {
      const id = req.params.id;
      const user = await getOne(req, id);
      if (!user) {
         return res.status(404).render('error/404', { message: 'Utilisateur non trouvé' });
      }
      res.render('user/edit', {user});
   }),

   updateUser: catchAsync(async (req: Request, res: Response) => {

    const id = req.params.id;
    const user: User = sanitizeInput(req.body);
  
    const filteredUser: Partial<User> = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => {
        return typeof value === 'string' ? value.trim() !== '' : true;
      })
    );

   await update(req, Number(id), filteredUser);
   res.redirect('/users');
  }),     

   deleteUser: catchAsync(async (req: Request, res: Response) => {

      const id = req.params.id;
      const user: User = await getOne(req, id);

      if (!user) {
         return res.status(404).render('error/404');
      }

      try{
         await remove(req, Number(id));          
         res.redirect('/users');
      } catch (error) {
         res.render('user/show', {
            user,
            error: (error as Error).message || 'Erreur lors de la suppression.'
         });
      }
   })

}

export default userController;