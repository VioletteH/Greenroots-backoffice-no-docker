import { Request, Response } from 'express';
import { getAll, getOne, treeWithforestsAndStock, create, update, remove } from '../api/tree';
import { getAll as getAllForests } from '../api/forest';
import { Tree, TreeForm } from '../types/index';
import { catchAsync } from '../utils/catchAsync';
import { sanitizeInput } from "../utils/sanitize";

import fs from 'fs';
import path from 'path';

const treeController = {

   trees: catchAsync (async (req: Request, res: Response): Promise<void> => {

      const limit = 9;
      const page = Number(req.query.page as string) || 1;
      const offset = (page - 1) * limit;

      const { trees, total } = await getAll(limit, offset, true);
      const totalPages = total ? Math.ceil(total / limit) : 1;

      res.render('tree/index', {
         trees,
         currentPage: page,
         totalPages,
         hasNext: page < totalPages,
         hasPrevious: page > 1
      });

   }),

   tree: catchAsync(async (req:Request, res:Response) => {
      const id = req.params.id;
      const tree = await treeWithforestsAndStock(id);
      if (!tree) {
         return res.status(404).render('error/404');
      }
      res.render('tree/show', { tree, error: null });
   }),

   createTreeView: catchAsync(async (req:Request, res:Response) => {        
      const { forests } = await getAllForests();
      res.render('tree/new', { forests });
   }),

   createTree: catchAsync(async (req: Request, res: Response) => {
      
      const form: TreeForm = sanitizeInput(req.body);

      if (req.file) {
         form.image = `/uploads/trees/${req.file.filename}`;
      }

      const associations: { forestId: number ; stock: number }[] = [];

      if (form.forestAssociations && typeof form.forestAssociations === 'object') {
         for (const [forestId, assoc] of Object.entries(form.forestAssociations)) {
            if (assoc.checked) {
               const stock = parseInt(assoc.stock || '', 10);
               if (!isNaN(stock) && stock > 0) {
                  associations.push({ forestId: Number(forestId), stock });
               }
            }
         }
      }

      const treeToInsert: Omit<Tree, 'id' | 'createdAt' | 'updatedAt' | 'categorySlug'> & {
         forestAssociations: { forestId: number; stock: number }[];
      } = {
         ...form,
         forestAssociations: associations
      };

      await create(req, treeToInsert as unknown as Tree);
      res.redirect('/trees');
   }),

   updateTreeView: catchAsync(async (req:Request, res:Response) => {
      
      const id = req.params.id;
      const forestsResponse = await getAllForests();
      const forests = forestsResponse.forests ?? forestsResponse;
      const tree = await treeWithforestsAndStock(id);

      if (!tree) {
         return res.status(404).render('error/404');
      }
      res.render('tree/edit', { tree, forests });
   }),

   updateTree: catchAsync(async (req: Request, res: Response) => {

      const id = req.params.id;
      const form: TreeForm = sanitizeInput(req.body);
      const oldImage = form.oldImage;

      if (req.file) {
         const oldImagePath = path.join(__dirname, '../../public', oldImage);
         fs.unlink(oldImagePath, (err) => {
            if (err) {
               console.error('Erreur lors de la suppression de l\'ancienne image :', err);
            }
         });
         const imageUrl = `/uploads/trees/${req.file.filename}`;
         form.image = imageUrl;
      } else {
         form.image = oldImage;
      }

      const associations: { forestId: number; stock: number }[] = [];

      if (form.forestAssociations && typeof form.forestAssociations === 'object') {
         for (const [forestId, assoc] of Object.entries(form.forestAssociations)) {
           if (assoc.checked) {
             const stock = parseInt(assoc.stock || '', 10);
             if (!isNaN(stock) && stock > 0) {
               associations.push({
                 forestId: Number(forestId),
                 stock
               });
             }
           }
         }
      }

      const treeToUpdate: Omit<Tree, 'id' | 'createdAt' | 'updatedAt' | 'categorySlug'> & {
         forestAssociations: { forestId: number; stock: number }[];
      } = {
         name: form.name,
         scientific_name: form.scientific_name ?? '',
         category: form.category ?? '',
         description: form.description ?? '',
         image: form.image ?? '',
         co2: Number(form.co2 ?? 0),
         o2: Number(form.o2 ?? 0),
         price: Number(form.price ?? 0),
         forestAssociations: associations
      };

      await update(req, Number(id), treeToUpdate as unknown as Tree);
      res.redirect('/trees');
   }),

   deleteTree: catchAsync(async (req: Request, res: Response) => {
      
      const id = req.params.id;
      const tree: Tree = await getOne(id);

      if (!tree) {
         return res.status(404).render('error/404');
      }
      
      try{
         await remove(req, Number(id));

         if (tree.image) {
            const imagePath = path.join(__dirname, '../../public', tree.image);
            fs.unlink(imagePath, (err) => {
               if (err) {
                  console.error('Erreur lors de la suppression de l\'image :', err);
               }
            });
         }
         
         res.redirect('/trees');
      } catch (error) {
         res.render('tree/show', {
            tree,
            error: (error as Error).message || 'Erreur lors de la suppression.'
         });
      }
   }),
};

export default treeController;