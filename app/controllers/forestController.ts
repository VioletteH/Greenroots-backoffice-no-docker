import { Request, Response } from 'express';
import { Forest, ForestForm } from '../types/index';
import { getAll, getOne, forestWithTreesAndStock, create, update, remove } from '../api/forest';
import { getAll as getAllTrees } from '../api/tree';
import { catchAsync } from '../utils/catchAsync';
import { sanitizeInput } from "../utils/sanitize";

import fs from 'fs';
import path from 'path';

const forestController = {

   forests: catchAsync(async (req:Request, res:Response): Promise<void> => {

      const limit = 9;
      const page = Number(req.query.page as string) || 1;
      const offset = (page - 1) * limit;

      const { forests, total } = await getAll(limit, offset, true);
      const totalPages = total ? Math.ceil(total / limit) : 1;

      res.render('forest/index', { 
         forests,
         currentPage: page,
         totalPages,
         hasNext: page < totalPages,
         hasPrevious: page > 1
         });
   }),

   forest: catchAsync(async (req:Request, res:Response) => {
      const id = req.params.id;
      const forest = await forestWithTreesAndStock(id);
      if (!forest) {
         return res.status(404).render('error/404');
      }
      res.render('forest/show', { forest, error: null });
   }),

   createForestView: catchAsync(async (req:Request, res:Response) => {
      const { trees } = await getAllTrees();
      res.render('forest/new', { trees });
   }),

   createForest: catchAsync(async (req:Request, res:Response) => {
      
      const form: ForestForm = sanitizeInput(req.body);

      if (req.file) {
         form.image = `/uploads/forests/${req.file.filename}`;
      }

      const associations: { treeId: number ; stock: number }[] = [];

      if (form.treeAssociations && typeof form.treeAssociations === 'object') {
         for (const [treeId, assoc] of Object.entries(form.treeAssociations)) {
            if (assoc.checked) {
               const stock = parseInt(assoc.stock || '', 10);
               if (!isNaN(stock) && stock > 0) {
                  associations.push({
                     treeId: Number(treeId),
                     stock
                  });
               }
            }
         }
      }

      const forestToInsert: Omit<Forest, 'id' | 'createdAt' | 'updatedAt'> & {
         treeAssociations: { treeId: number; stock: number }[];
      } = {
         ...form,
         treeAssociations: associations
      };

      await create(req, forestToInsert as unknown as Forest);
      res.redirect('/forests');
   }),

   updateForestView: catchAsync(async (req:Request, res:Response) => {
      const id = req.params.id;
      const treesResponse = await getAllTrees();
      const trees = treesResponse.trees ?? treesResponse;
      const forest = await forestWithTreesAndStock(id);
      if (!forest) {
         return res.status(404).render('error/404');
      }
      res.render('forest/edit', {forest, trees});
   }),

   updateForest: catchAsync(async (req:Request, res:Response) => {

      const id = req.params.id;
      const form: ForestForm = sanitizeInput(req.body);
      const oldImage = form.oldImage

      if (req.file) {
         const oldImagePath = path.join(__dirname, '../../public', oldImage);
         fs.unlink(oldImagePath, (err) => {
            if (err) {
               console.error('Erreur lors de la suppression de l\'ancienne image :', err);
            }
         });
         const imageUrl = `/uploads/forests/${req.file.filename}`;
         form.image = imageUrl;
      } else {
         form.image = oldImage;
      }

      const associations: { treeId: number; stock: number }[] = [];

      if (form.treeAssociations && typeof form.treeAssociations === 'object') {
         for (const [treeId, assoc] of Object.entries(form.treeAssociations)) {
            if (assoc.checked) {
               const stock = parseInt(assoc.stock || '', 10);
               if (!isNaN(stock) && stock > 0) {
                  associations.push({
                     treeId: Number(treeId),
                     stock
                  });
               }
            }
         }
      }

      const forestToUpdate: Omit<Forest, 'id' | 'createdAt' | 'updatedAt' | 'countrySlug'> & {
         treeAssociations: { treeId: number; stock: number }[];
      } = {
         name: form.name,
         association: form.association ?? '',
         country: form.country ?? '',
         description: form.description ?? '',
         image: form.image ?? '',
         location_x: Number(form.location_x ?? 0),
         location_y: Number(form.location_y ?? 0),
         treeAssociations: associations
      };
 
      await update(req, Number(id), forestToUpdate as unknown as Forest);
      res.redirect('/forests');
   }),

   deleteForest: catchAsync(async (req:Request, res:Response) => {
      
      const id = req.params.id;
      const forest: Forest = await getOne(id);

      if (!forest) {
         return res.status(404).render('error/404');
      }

      try{
         await remove(req, Number(id));

         if (forest.image) {
            const imagePath = path.join(__dirname, '../../public', forest.image);
            fs.unlink(imagePath, (err) => {
               if (err) {
                  console.error('Erreur lors de la suppression de l\'image :', err);
               }
            });
         }

         res.redirect('/forests');
      } catch (error) {
         res.render('forest/show', {
            forest,
            error: (error as Error).message || 'Erreur lors de la suppression.'
         });
      }      
      
   })      
}

export default forestController;