import axios from "axios";
import { Forest, ForestWithTreesAndStock } from "../types/index";
import { createAxiosWithAuth } from "../utils/axiosInstance";
import { Request } from "express";

const BASE_URL = process.env.API_BASE_URL;
const api_url = BASE_URL + '/forests';

export const getAll = async (limit?: number, offset: number = 0, withCount: boolean = true): Promise<{ forests: Forest[]; total?: number }> => {
  const response = await axios.get(`${api_url}?limit=${limit}&offset=${offset}${withCount ? '&withCount=true' : ''}`);
  return response.data;
};

export const getOne = async (id: string): Promise<Forest> => {
  const response = await axios.get(`${api_url}/${id}`);
  return response.data;
};

export const forestWithTreesAndStock = async (id: string): Promise<ForestWithTreesAndStock> => {
  const response = await axios.get(`${api_url}/${id}/trees-and-stock`);
  return response.data;
};

export const create = async (req: Request, forest: Forest): Promise<ForestWithTreesAndStock> => {
  const axiosInstance = createAxiosWithAuth(req);
  const response = await axiosInstance.post(`${api_url}`, forest);
  return response.data;
};

export const update = async (req: Request, id: number, forest: Forest): Promise<ForestWithTreesAndStock> => {
  const axiosInstance = createAxiosWithAuth(req);
  const response = await axiosInstance.patch(`${api_url}/${id}`, forest);
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