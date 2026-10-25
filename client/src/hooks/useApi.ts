import { useCallback, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/lib/api";

type ReqType = "get" | "post" | "put" | "delete";

interface ApiState<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
    isSuccess: boolean;
    request: (payload?: unknown) => Promise<T | null>;
}

export function useApi<T>(endpoint: string, method: ReqType): ApiState<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const request = useCallback(async (payload?: unknown): Promise<T | null> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const res = await api.request<T>({ url: endpoint, method, data: payload });
            setData(res.data);
            setIsSuccess(true);
            return res.data;
        } catch (e: unknown) {
            const message = isAxiosError(e) ? e.response?.data?.message : undefined;
            setError(message ?? "Request failed");
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, method]);

    return { data, error, isLoading, isSuccess, request };
}
