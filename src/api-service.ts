import axios from "axios";

import { serverHost } from "./config";

export default class ApiService {
    public static serverURL: string = serverHost;
    public static apiURL: string = serverHost + "/api";

    /**
     * Returns a boolean whether the creation was succesfull or not.
     * @param body 
     */
    public static createMatch(body: any): Promise<boolean> {
        return axios.post(this.apiURL + "/create-match", body, { withCredentials: true })
            .then(res => {
                console.log("Create match success");
                return true;
            }).catch(error => {
                console.error("Error while creating match:", error);
                return false;
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