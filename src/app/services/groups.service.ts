import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Group } from '../models/group';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
    providedIn: 'root'
})
export class GroupService {

    private data: any[];
    private baseUrl = serverBase + '/groups';
    constructor(private spinner: SpinnerService, private http: HttpClient) {
        this.data = [
            {
                id: '1',
                firstName: 'Om',
                lastName: 'Patil',
                age: '30',
                occupation: 'Software Engineer',
                fatherName: '',
                motherName: '',
                mothersPlace: '',
                location: 'Pune',
                currentAddress: {
                    city: 'Pune',
                    tehsil: 'Mulshi',
                    district: 'Pune',
                    state: 'Maha',
                    country: 'India'
                },
                permanentAddress: {
                    city: 'Pune',
                    tehsil: 'Mulshi',
                    state: 'Maha',
                    country: 'India'
                }
            },
            {
                id: '2',
                firstName: 'Rahul',
                lastName: 'Patil',
                age: '30',
                occupation: 'Software Engineer',
                location: 'Pune',
                currentAddress: {},
                permanentAddress: {}
            },
            {
                id: '3',
                firstName: 'Om',
                lastName: 'Patil',
                age: '30',
                occupation: 'Software Engineer',
                location: 'Pune',
                currentAddress: {},
                permanentAddress: {}
            },
            {
                id: '4',
                firstName: 'Om',
                lastName: 'Patil',
                age: '30',
                occupation: 'Software Engineer',
                location: 'Pune',
                currentAddress: {},
                permanentAddress: {}
            }
        ];
    }


    getGroups() {
        return this.http.get(this.baseUrl);
    }

    getGroup(id: string) {
        //  return this.http.get(this.baseUrl+'/'+id); 
        return this.data.find(group => group.id === id);
    }

    saveGroup(group: any) {
        return this.http.post(this.baseUrl, group);
    }


    updateGroup(id: string, groupData: Group) {

    }

    deleteGroup(id: string) {
        return this.http.delete(this.baseUrl + '/' + id);
    }
    backUp() {
        return this.http.post(this.baseUrl + '/backup', {});
    }
}
