import axios, { AxiosRequestConfig } from 'axios';

export const apiUrl = '';

export const apiClient = axios.create({
    baseURL: apiUrl
});

export class ApiClients<T> {
    constructor(private Url: string) {}

    private async catchError<T>(promise: Promise<T>): Promise<[undefined, T] | [Error]> {
        return promise.then((data) => [undefined, data] as [undefined, T]).catch((error) => [error]);
    }

    // Fetch all items
    async getAll(config?: AxiosRequestConfig<any>): Promise<[undefined, T[]] | [Error]> {
        return this.catchError(apiClient.get<T[]>(this.Url, config).then((res) => res.data));
    }

    // Fetch one item by ID
    async getOne(id: string | number, config?: AxiosRequestConfig<any>): Promise<[undefined, T] | [Error]> {
        return this.catchError(apiClient.get<T>(`${this.Url}${id}/`, config).then((res) => res.data));
    }

    // Fetch paginated items
    async getPaginated(
        config?: AxiosRequestConfig<any>
    ): Promise<[undefined, { results: T[]; next: string; previous: string; count: number }] | [Error]> {
        return this.catchError(
            apiClient
                .get<{
                    results: T[];
                    next: string;
                    previous: string;
                    count: number;
                }>(this.Url, config)
                .then((res) => res.data)
        );
    }

    // Create a new item
    async post(data: Partial<T>, config?: AxiosRequestConfig<any>): Promise<[undefined, T] | [Error]> {
        return this.catchError(apiClient.post<T>(this.Url, data, config).then((res) => res.data));
    }

    // Delete an item by ID
    async delete(id: string | number, config?: AxiosRequestConfig<any>): Promise<[undefined, void] | [Error]> {
        return this.catchError(apiClient.delete(`${this.Url}${id}/`, config).then(() => undefined));
    }

    // Partially update an item
    async patch(
        id: string | number,
        data: Partial<T>,
        config?: AxiosRequestConfig<any>
    ): Promise<[undefined, T] | [Error]> {
        return this.catchError(apiClient.patch<T>(`${this.Url}${id}/`, data, config).then((res) => res.data));
    }

    // Fully update an item
    async put(id: string | number, data: T, config?: AxiosRequestConfig<any>): Promise<[undefined, T] | [Error]> {
        return this.catchError(apiClient.put<T>(`${this.Url}${id}/`, data, config).then((res) => res.data));
    }

    async costumePost<T>(url: string, data: T, config?: AxiosRequestConfig<any>): Promise<[undefined, T] | [Error]> {
        return this.catchError(apiClient.post(url, data, config).then((res) => res.data));
    }
}
