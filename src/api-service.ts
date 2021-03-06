import axios from "axios";

import { config } from "./config";

export default class ApiService {
    public static serverURL: string = config.serverHost;
    public static apiURL: string = config.serverHost + "/api";

    /**
     * Attempt to create a new match on the server. Returns with result and invite code
     */
    public static createMatch(): Promise<any> {
        return axios.post(this.apiURL + "/match/create", { }, { withCredentials: true })
            .then((res) => {
                return {
                    result: res.data.result,
                    errorMessage: res.data.errorMessage,
                    code: res.data.code,
                    link: res.data.link,
                };
            }).catch((error) => {
                return ApiService.handleErrorMessage(error);
            });
    }

    public static checkMatchExists(code: string): Promise<any> {
        return axios.post(this.apiURL + "/match/exists/" + code, { }, { withCredentials: true })
            .then((res) => {
                return res.data;
            }).catch((error) => {
                return ApiService.handleErrorMessage(error);
            });
    }

    public static renameMatch(code: string, name: string): Promise<any> {
        return axios.post(this.apiURL + "/match/rename/" + code, { name: name }, { withCredentials: true })
            .then((res) => {
                return res.data;
            }).catch((error) => {
                return ApiService.handleErrorMessage(error);
            });
    }

    public static allowJoinMatch(code: string, allow: boolean): Promise<any> {
        return axios.post(this.apiURL + "/match/allow-join/" + code, { allow: allow }, { withCredentials: true })
            .then((res) => {
                return res.data;
            }).catch((error) => {
                return ApiService.handleErrorMessage(error);
            });
    }

    public static changePrivacyMatch(code: string, isPrivate: boolean): Promise<any> {
        return axios.post(this.apiURL + "/match/change-privacy/" + code, { isPrivate: isPrivate }, { withCredentials: true })
            .then((res) => {
                return res.data;
            }).catch((error) => {
                return ApiService.handleErrorMessage(error);
            });
    }

    public static getMatch(code: string): Promise<any> {
        return axios.get(this.apiURL + "/match/" + code, { withCredentials: true })
            .then((res) => {
                return res.data;
            }).catch((error) => {
                return ApiService.handleErrorMessage(error);
            });
    }

    public static getMapPoolData(): Promise<any> {
        return axios.get(this.apiURL + "/mappools", { withCredentials: true })
            .then((res) => {
                return res.data.data; // Array of maps
            }).catch((error) => {
                return ApiService.handleErrorMessage(error);
            });
    }

    public static setMatchMapPool(code: string, id: string): Promise<any> {
        return axios.post(this.apiURL + "/match/mappool/" + code, { mapPoolId: id }, { withCredentials: true })
            .then((res) => {
                return res.data; // Success/error
            }).catch((error) => {
                return ApiService.handleErrorMessage(error);
            });
    }

    public static getUser(): Promise<any> {
        return axios.get(this.apiURL + "/user", { withCredentials: true })
            .then((res) => {
                return res.data;
            }).catch((error) => {
                return { result: false, errorMessage: "Unable to connect to the server." };
            });
    }

    public static setGuest(name: string): Promise<any> {
        const body = {
            guestName: name,
        };

        return axios.post(this.apiURL + "/user", body, { withCredentials: true })
            .then((res: any) => {
                return res.data;
            }).catch((error) => {
                return ApiService.handleErrorMessage(error);
            });

    }

    private static handleErrorMessage(error: any) {
        return {
            result: false,
            errorMessage: 
                (error.response.data.error !== undefined ? 
                error.response.data.error :
                error.response.data.validationErrors.map((error: any) => error.msg).join(", "))
        };
    }
}
