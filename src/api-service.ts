import axios from "axios";

import { apiHost } from "./config";

export default class ApiService {
    public apiURL: string = apiHost;

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
            console.log("Error while creating match");
            return false;
        });
    }
    
}