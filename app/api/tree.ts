import axios from 'axios';
import { Tree, TreeWithForestsAndStock } from '../types/index';
import { createAxiosWithAuth } from "../utils/axiosInstance";
import { Request } from "express";

const BASE_URL = process.env.API_BASE_URL;
const api_url = BASE_URL + '/trees';

export const getAll = async (limit?: number, offset: number = 0, withCount: boolean = true): Promise<{ trees: Tree[]; total?: number }> => {
    const response = await axios.get(`${api_url}?limit=${limit}&offset=${offset}${withCount ? '&withCount=true' : ''}`);
    return response.data;
};

export const getOne = async (id: string): Promise<Tree> => {
    const response = await axios.get(`${api_url}/${id}`);  
    return response.data;
};

export const treeWithforestsAndStock = async (id: string): Promise<TreeWithForestsAndStock> => {
    const response = await axios.get(`${api_url}/${id}/forests-and-stock`);
    return response.data;
  };

export const create = async (req: Request, tree: Tree): Promise<TreeWithForestsAndStock> => {
    const axiosInstance = createAxiosWithAuth(req);
    const response = await axiosInstance.post(`${api_url}`, tree);
    return response.data;
};

export const update = async (req: Request, id: number, tree: Tree): Promise<TreeWithForestsAndStock> => {
    const axiosInstance = createAxiosWithAuth(req);
    const response = await axiosInstance.patch(`${api_url}/${id}`, tree);  
    return response.data;
};

export const remove = async (req: Request, id: number): Promise<void> => {
    const axiosInstance = createAxiosWithAuth(req);
    try {
        await axiosInstance.delete(`${api_url}/${id}`);
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Erreur API');
        }
        throw new Error("Erreur inconnue lors de la suppression.");
    }
};