import { useEffect, useRef } from "react";
import { errorHandler } from "../services/errorhandler.service";
import { authService } from "../main";

export const useTokenRefresher = () => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const iniciarRefrescoToken = () => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) return;

        const expirationDate = new Date(JSON.parse(atob(jwt.split(".")[1])).exp * 1000);
        const now = new Date();

        const timeUntilExpiration = expirationDate.getTime() - now.getTime();

        if (timeUntilExpiration > 0) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                console.log("Refrescando token...");
                refrescarToken();
            }, timeUntilExpiration - 60000);
        }
    };

    const refrescarToken = () => {
        if (localStorage.getItem("jwt")) {
            authService.refreshToken().then(
                (response) => {
                    localStorage.setItem("jwt", response.data);
                    iniciarRefrescoToken();
                },
                (error) => {
                    errorHandler(error);
                }
            );
        }
    };

    useEffect(() => {
        iniciarRefrescoToken();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);
};
