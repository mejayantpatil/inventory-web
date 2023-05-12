

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Vehicle } from '../models/vehicle';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
    providedIn: 'root'
})
export class VehicleService {

    private data: any[];
    private baseUrl = serverBase + '/vehicles';
    constructor(private spinner: SpinnerService, private http: HttpClient) {
        this.data = [{}]
    }


    getVehicles() {
        return this.http.get(this.baseUrl);
    }

    getVehicle(id: string) {
        return this.http.get(this.baseUrl + '/' + id);
        // return this.data.find(vehicle => vehicle.id === id);
    }

    saveVehicle(vehicle: any) {
        return this.http.post(this.baseUrl, vehicle);
    }


    updateVehicle(id: string, vehicleData: Vehicle) {
        return this.http.put(this.baseUrl + '/' + id, vehicleData);
    }

    deleteVehicle(id: string) {
        return this.http.delete(this.baseUrl + '/' + id);
    }
    backUp() {
        return this.http.post(this.baseUrl + '/backup', {});
    }
}
