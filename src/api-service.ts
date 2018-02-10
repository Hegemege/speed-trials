import axios from "axios";

import { serverHost } from "./config";

export default class ApiService {
    public static serverURL: string = serverHost;
    public static apiURL: string = serverHost + "/api";

    /**
     * Attempt to create a new match on the server. Returns with result and invite code
     */
    public static createMatch(): Promise<any> {
        return axios.post(this.apiURL + "/create-match", { }, { withCredentials: true })
            .then((res) => {
                return {
                    result: res.data.result,
                    errorMessage: res.data.errorMessage,
                    code: res.data.code,
                    link: res.data.link,
                };
            }).catch((error) => {
                return { result: false, errorMessage: "Unable to create match." };
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
                if (res.data.result) {
                    return { result: true };
                }

                return {
                    result: false,
                    errorMessage: res.data.validationErrors.map((error: any) => error.msg).join(", "),
                };
            }).catch((error) => {
                return { result: false, errorMessage: "Unable to set guest name." };
            });

    }
}
