import { Request, Response } from 'express';
import { getAll, getOne, update } from '../api/order';
import { Order } from '../types/index';
import { sanitizeInput } from "../utils/sanitize";
import { catchAsync } from '../utils/catchAsync';

const statusMap: { [key: number]: string } = {
    1: 'En cours',
    2: 'Terminée',
    3: 'Annulée'
};

const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return "Date inconnue";
    
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris',
    });
};

const formatOrder = (order: Order): Order & {
    createdAtFormatted: string,
    updatedAtFormatted: string,
    statusLabel: string
} => ({
    ...order,
    createdAtFormatted: formatDate(order.createdAt),
    updatedAtFormatted: formatDate(order.updatedAt),
    statusLabel: statusMap[Number(order.status)] || 'Statut inconnu'
});

const orderController = {

    orders: catchAsync(async (req: Request, res: Response): Promise<void> => {

        const limit = 9;
        const page = Number(req.query.page as string) || 1;
        const offset = (page - 1) * limit;

        const { orders, total } = await getAll(req, limit, offset, true);
        const totalPages = total ? Math.ceil(total / limit) : 1;

        const formattedOrders = orders.map(formatOrder);   
            
        res.render('order/index', { 
            orders: formattedOrders,
            currentPage: page,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
        });
    }),

    order: catchAsync(async (req:Request, res:Response) => {
        const id = parseInt(req.params.id, 10);
        const order: Order = await getOne(req, id);
        if (!order) {
            return res.status(404).render('error/404');
        }
        res.render('order/show', { order: formatOrder(order) });
    }),

    updateOrderView: catchAsync(async (req:Request, res:Response) => {
        const id = parseInt(req.params.id, 10);
        const order = await getOne(req, id);
        if (!order) {
            return res.status(404).render('error/404');
        }
        res.render('order/edit', { order: formatOrder(order) });
    }),

    updateOrder: catchAsync(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id, 10);
        const { status } = sanitizeInput(req.body);
        if (![1, 2, 3].includes(Number(status))) {
            return res.status(400).render('error/400', { message: 'Statut invalide' });
        }
        await update(req, Number(id), { status: Number(status) });
        res.redirect('/orders');
    }),
};

export default orderController;