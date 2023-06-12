import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Job } from '../models/jobs';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
    providedIn: 'root'
})
export class JobService {

    private data: any[];
    private baseUrl = serverBase + '/jobs';
    constructor(private spinner: SpinnerService, private http: HttpClient) {
        this.data = [{}];
    }


    getJobs() {
        return this.http.get(this.baseUrl);
    }

    getJobsByCategory(categoryID: string) {
        return this.http.get(this.baseUrl + '/category/' + categoryID);
    }

    getJob(id: string) {
        return this.http.get(this.baseUrl + '/' + id);
        // return this.data.find(job => job.id === id);
    }

    saveJob(job: any) {
        return this.http.post(this.baseUrl, job);
    }


    updateJob(id: string, jobData: Job) {
        // this.spinner.showSpinner();
        return this.http.put(this.baseUrl + '/' + id, jobData);
        //     this.data.map((job, index) => {
        //         if (job.id === id) {
        //             this.data[index] = jobData
        //         }
        //     });
        //     setTimeout(() => {
        //         this.spinner.hideSpinner();
        //     }, 1000);
    }

    deleteJob(id: string) {
        return this.http.delete(this.baseUrl + '/' + id);
    }

    uploadFile(file: any) {

        const formData = new FormData();
        formData.append("file", file);
        // const upload$ = this.http.post("/upload", formData);
        return this.http.post(this.baseUrl + '/upload', formData);
    }

    getJobByDate(startDate: string, endDate: string) {
        return this.http.post(this.baseUrl + '/getByDate', { startDate, endDate });
    }
    backUp() {
        return this.http.post(this.baseUrl + '/backup', {});
    }
}
