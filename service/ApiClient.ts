import axios, { AxiosRequestConfig } from 'axios';

const ip = '';

export const apiUrl = `http://${ip}/`;

export const apiClient = axios.create({
    baseURL: apiUrl
});

export class ApiClient<T> {
    private static _baseUrl: string = `http://${ip}`;

    constructor(private Url: string) {}

    private async catchError<T>(promise: Promise<T>): Promise<[undefined, T] | [Error]> {
        return promise.then((data) => [undefined, data] as [undefined, T]).catch((error) => [error]);
    }

    private buildUrlWithParams(params?: { [param: string]: string | number }): string {
        const url = new URL(ApiClient._baseUrl + this.Url);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value.toString());
            });
        }
        return url.toString();
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

    // Fech all items cached
    async getAllCache(
        params?: { [param: string]: string | number },
        init?: RequestInit
    ): Promise<[undefined, T[]] | [Error]> {
        return this.catchError(
            (async () => {
                const url = this.buildUrlWithParams(params);
                const response = await fetch(url, init);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: T[] = await response.json();

                return data;
            })()
        );
    }

    // Fetch one item by ID cached
    async getOneCache() {}

    async getPaginatedCache(
        params?: { [param: string]: string | number },
        init?: RequestInit
    ): Promise<[undefined, { results: T[]; next: string; previous: string; count: number }] | [Error]> {
        return this.catchError(
            (async () => {
                // Use the utility function to build the URL
                const url = this.buildUrlWithParams(params);

                // Make the fetch request with the constructed URL and init options
                const response = await fetch(url, init);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: {
                    results: T[];
                    next: string;
                    previous: string;
                    count: number;
                } = await response.json();

                return data;
            })()
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

    async costumePost<T>(
        url: string,
        data: Partial<T>,
        config?: AxiosRequestConfig<any>
    ): Promise<[undefined, T] | [Error]> {
        return this.catchError(apiClient.post(url, data, config).then((res) => res.data));
    }
}
