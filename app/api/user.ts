import axios from "axios";
import { User } from "../types/index";
import { createAxiosWithAuth } from "../utils/axiosInstance";
import { Request } from "express";

const BASE_URL = process.env.API_BASE_URL;
const api_url = BASE_URL + '/users';

export const getAll = async (req: Request, limit = 9, offset = 0, withCount = true): Promise<{ users: User[]; total?: number }> => {
  const axiosInstance = createAxiosWithAuth(req);
  const response = await axiosInstance.get(`${api_url}?limit=${limit}&offset=${offset}${withCount ? '&withCount=true' : ''}`);
  return response.data;
};

export const getOne = async (req: Request, id: string): Promise<User> => {
  const axiosInstance = createAxiosWithAuth(req);
  const response = await axiosInstance.get(`${api_url}/${id}`);
  return response.data;
};

export const create = async (req: Request, user: User): Promise<User> => {
  const axiosInstance = createAxiosWithAuth(req);
  const response = await axiosInstance.post(`${api_url}`, user);
  return response.data;
};

export const update = async (req: Request, id: number, user: Partial<User>): Promise<User> => {
  const axiosInstance = createAxiosWithAuth(req);
  const response = await axiosInstance.patch(`${api_url}/${id}?backoffice=true`, user);
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