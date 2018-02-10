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
            .then(res => {
                return { 
                    result: res.data.result, 
                    errorMessage: res.data.errorMessage,
                    code: res.data.code, 
                    link: res.data.link
                };
            }).catch(error => {
                console.error("Error while creating match:", error);
                return { result: false, errorMessage: error };
            });
    }

    public static getUser(): Promise<any> {
        return axios.get(this.apiURL + "/user", { withCredentials: true })
            .then(res => {
                return res.data;
            }).catch(error => {
                console.error("Error while getting user:", error);
                return "";
            });
    }

    public static setGuest(name: string): Promise<any> {
        let body = {
            guestName: name
        };
        
        return axios.post(this.apiURL + "/user", body, { withCredentials: true })
            .then((res: any) => {
                if (res.data["message"]) {
                    return { result: true };
                }

                return { 
                    result: false, 
                    errorMessage: res.data.map((error: any) => error.msg).join(", ") 
                };
            }).catch(error => {
                console.error("Error while setting guest user:", error);
                return false;
            });

    }
}