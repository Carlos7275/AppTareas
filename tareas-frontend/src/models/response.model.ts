export interface Peticion<T> {
    message: string;
    data: T | T[];
    total?: Number;
    search?: string;
}
