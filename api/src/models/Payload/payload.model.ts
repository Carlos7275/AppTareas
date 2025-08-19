export interface PayloadModel {
    iss?: string;
    sub?: string;
    aud?: string;
    nbf?: number;
    jti?: string;
    email: string;
    exp?: number;
    iat?: number;
    uid: number;
    username: string;
    idrol:number;
    rol:string;
}