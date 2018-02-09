import axios from "axios";

import { serverHost } from "./config";

export default class ApiService {
    public serverURL: string = serverHost;
    public apiURL: string = serverHost + "/api";
    /**
     * Returns a boolean whether the creation was succesfull or not.
     * @param body 
     */
    public createMatch(body: any): Promise<boolean> {
        return axios.post(this.apiURL + "/create-match", body)
        .then(res => {
            console.log("Create match success");
            return true;
        }).catch(error => {
            console.error("Error while creating match:", error);
            return false;
        });
    }
    
}