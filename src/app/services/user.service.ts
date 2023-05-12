import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private data: any[];
  private baseUrl = serverBase + '/users';
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


  getUsers() {
    return this.http.get(this.baseUrl);
  }

  getUser(id: string) {
    //  return this.http.get(this.baseUrl+'/'+id); 
    return this.data.find(user => user.id === id);
  }

  saveUser(user: any) {
    return this.http.post(this.baseUrl, user);
  }


  updateUser(id: string, userData: User) {
    this.spinner.showSpinner();
    this.data.map((user, index) => {
      if (user.id === id) {
        this.data[index] = userData
      }
    });
    setTimeout(() => {
      this.spinner.hideSpinner();
    }, 1000);
  }
}
