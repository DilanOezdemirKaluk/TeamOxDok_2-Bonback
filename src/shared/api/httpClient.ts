import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { apiConfig } from "./config";
import { store } from "../store/redux";

class HttpClient {
  public client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add a request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const state = store.getState();
        const token = state.user?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      // Handle errors here
      throw error;
    }
  }

  async post<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      // Handle errors here
      throw error;
    }
  }

  async put<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      // Handle errors here
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      // Handle errors here
      throw error;
    }
  }
}

export const httpClient = new HttpClient().client;
