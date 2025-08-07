import axios from "axios";
import * as cookieLib from "cookie";
import { Request } from "express";

const API_URL = process.env.API_BASE_URL;

export function createAxiosWithAuth(req: Request) {
  const cookies = cookieLib.parse(req.headers.cookie || "");
  const token = cookies.tokenbo;

  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};
