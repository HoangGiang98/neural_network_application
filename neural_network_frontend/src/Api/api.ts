import Endpoint from "Api/Endpoint";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { BmMLApiResponse, BmMLHttpMethod } from "Types/types";

export const apiConfig = '/api';

const DEFAULT_REQUEST_CONFIG: Partial<AxiosRequestConfig> = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
};

export const api = {
  postToServer,
  getFromServer,
};

async function postToServer<T, R = any>(
  path: Endpoint,
  data?: T,
  options: Partial<AxiosRequestConfig> = DEFAULT_REQUEST_CONFIG
): Promise<BmMLApiResponse<R>> {
  return apiCall(path, {
    method: BmMLHttpMethod.POST,
    data: data,
    ...options,
  });
}

async function getFromServer<R = any>(
  path: Endpoint,
  options: Partial<AxiosRequestConfig> = DEFAULT_REQUEST_CONFIG
): Promise<BmMLApiResponse<R>> {
  return apiCall(path, {
    method: BmMLHttpMethod.GET,
    ...options,
  });
}
async function apiCall(
  path: Endpoint,
  options: Partial<AxiosRequestConfig>
): Promise<BmMLApiResponse> {
  return axios({
    url: `${apiConfig}${String(path)}`,
    ...options,
  })
    .then((response: AxiosResponse) => {
      return {
        ok: true,
        message: response.statusText,
        status: response.status,
        data: response.data,
      };
    })
    .catch((error) => {
      return {
        ok: false,
        message: error.message,
      };
    });
}
