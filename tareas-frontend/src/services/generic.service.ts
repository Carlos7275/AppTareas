// services/BaseService.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { environment } from '../main';

export default class GenericService {
    protected api: AxiosInstance;


    constructor() {
        this.api = axios.create({
            baseURL: environment,
            headers: { 'Content-Type': 'application/json' }
        });

        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("jwt");
                if (token) {
                    config.headers!["Authorization"] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }


}
