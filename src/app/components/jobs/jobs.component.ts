import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Job } from 'src/app/models/jobs';
import { CategoryService } from 'src/app/services/category.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { JobService } from 'src/app/services/jobs.service';
import * as XLSX from 'xlsx'
import { VehicleService } from 'src/app/services/vehicle.service';
@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent {
  private fileName: string = 'Jobs Data ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public data: any[] = [];
  public Job: any = {};
  public Jobs: any[] = [];
  public showNewJobForm: boolean = false;
  public JobForm: FormGroup;
  public editJobFlag: boolean = false;
  public categorys: any[] = [];
  public categroysObj: any = {};
  public selectedDevice: string = '';
  public fileToUpload: File | null = null;
  public file: any;
  public files: any;
  public showFileUpload: boolean = false;
  public jobCardNo: string = '';
  public originalData: Job[] = [];
  public selectedJob: any = {};
  public selectedRowIndex = -1;
  public status: string = 'all'
  public selectedVehicle = ''
  public vehicles: any = [];
  @ViewChild('closeModal') closeModal: any
  @ViewChild('mySelect') mySelect: any;
  constructor(private jobService: JobService,
    private router: Router,
    private vehicleService: VehicleService,
    private categoryService: CategoryService, private spinner: SpinnerService) {
    this.JobForm = new FormGroup({
      jobNo: new FormControl(''),
      paymentMode: new FormControl(''),
      supplierInvoiceNo: new FormControl(''),
      supplierName: new FormControl(''),
      date: new FormControl(''),
      grossAmount: new FormControl(''),
      gst: new FormControl(''),
      tradeDiscount: new FormControl(''),
      igst: new FormControl(''),
      grandTotal: new FormControl(''),
      cashDiscount: new FormControl(''),
      otherCharges: new FormControl(''),
      netAmount: new FormControl(''),
    })
  }
  ngOnInit(): void {
    this.getAllJobs();
    this.getAllCategories();
    this.getVehicles();

  }

  getVehicles() {
    this.vehicleService.getVehicles().subscribe(res => {
      this.vehicles = res;
    })
  }
  getAllCategories() {
    this.categoryService.getCategorys().subscribe((res: any) => {
      this.categorys = res;
      this.categorys.forEach(c => {
        this.categroysObj[c._id] = c.categoryName;
      });
    })
  }

  getAllJobs() {
    this.spinner.showSpinner();
    this.jobService.getJobs().subscribe((res: any) => {
      this.spinner.hideSpinner();
      const data: any = [];
      this.originalData = res;
      res.forEach((i: any) => {
        let arr = {}
        i.cardData.map((c: any, index: number) => {
          if (index > 0) return;
          arr = { _id: i._id, jobCardNo: i.jobCardNo, ...c };
          data.push(arr);
        })
      })
      data.sort((a: Job, b: Job) => {
        const aa = parseInt(a.jobCardNo)
        const bb = parseInt(b.jobCardNo)
        return bb - aa;
      });
      this.Jobs = data;
      this.data = data;
    });
  }

  initializeForm() {
    this.JobForm = new FormGroup({
      jobNo: new FormControl(''),
      paymentMode: new FormControl(''),
      supplierInvoiceNo: new FormControl(''),
      supplierName: new FormControl(''),
      date: new FormControl(''),
      grossAmount: new FormControl(''),
      gst: new FormControl(''),
      tradeDiscount: new FormControl(''),
      igst: new FormControl(''),
      grandTotal: new FormControl(''),
      cashDiscount: new FormControl(''),
      otherCharges: new FormControl(''),
      netAmount: new FormControl(''),
    })
  }
  newJob() {
    this.router.navigate(['job-card']);
    return;
    // this.editJobFlag = true
    // this.showNewJobForm = true
    const date = new Date();
    const jobCardNo = this.data.length > 0 ? date.getFullYear() + '_' + (this.data.length) : date.getFullYear() + '_' + 1
    this.jobService.saveJob({
      jobCardNo: jobCardNo,
      cardData: []
      // recordNo: 0,
      // paymentMode: '',
      // jobCardDate: '',
      // billDate: '',
      // spareParts: [],
      // mechanicName: '',
      // chasisNumber: '',
      // engineNumber: '',
      // registrationNumber: '',
      // modelName: '',
      // kmCovered: 0,
      // oilChange: '',
      // problem: '',
      // netAmount: 0,
      // comment: '',
      // status: ''
    }).subscribe(() => {
      this.cancel();
      // this.router.navigate(['job-card', jobCardNo]);
      this.router.navigate(['job-card']);
      // this.getAllJobs();
    })
  }

  toggleDetails(i: number, job: Job) {
    this.selectedRowIndex = this.selectedRowIndex !== i ? i : -1
  }

  busWise() {
    this.mySelect.nativeElement.value = ''
    this.status = 'all';
    this.jobCardNo = ''
    this.data = this.selectedVehicle ? this.Jobs.filter((d: any) => d.registrationNumber === this.selectedVehicle || d.registrationNumber.includes(this.selectedVehicle.split(' ')[0])) : this.Jobs
  }

  editJob(job: Job) {
    this.router.navigate(['job-card', job.jobCardNo]);
    return;
    // this.editJobFlag = true
    // this.showNewJobForm = true
    // this.JobForm = new FormGroup({
    //   jobNo: new FormControl(job.jobNo),
    //   paymentMode: new FormControl(job.paymentMode),
    //   supplierInvoiceNo: new FormControl(job.supplierInvoiceNo),
    //   supplierName: new FormControl(job.supplierName),
    //   date: new FormControl(job.date),
    //   grossAmount: new FormControl(job.grossAmount),
    //   gst: new FormControl(job.gst),
    //   tradeDiscount: new FormControl(job.tradeDiscount),
    //   igst: new FormControl(job.igst),
    //   grandTotal: new FormControl(job.grandTotal),
    //   cashDiscount: new FormControl(job.cashDiscount),
    //   otherCharges: new FormControl(job.otherCharges),
    //   netAmount: new FormControl(job.netAmount),
    // })
  }

  // saveJob(job: Job) {
  //   const jobData = {
  //     "jobNo": this.data.length > 0 ? this.data[0].jobNo + 1 : 1,
  //   }
  //   if (this.JobForm.valid && job._id) {
  //     // update
  //     this.jobService.updateJob(job._id, this.JobForm.value).subscribe(() => {
  //       this.cancel();
  //       this.getAllJobs();
  //     })
  //   } else if (this.JobForm.valid) {
  //     // save 
  //     this.jobService.saveJob({
  //       "jobNo": this.data.length > 0 ? this.data[0].jobNo + 1 : 1,
  //       "paymentMode": "",
  //       "supplierInvoiceNo": 0,
  //       "supplierName": "",
  //       "date": "12/12/2022",
  //       "data": [],
  //       "grossAmount": 0,
  //       "gst": 0,
  //       "tradeDiscount": 0,
  //       "igst": 0,
  //       "grandTotal": 0,
  //       "cashDiscount": 0,
  //       "otherCharges": 0,
  //       "netAmount": 0,
  //       "comment": ""
  //     }).subscribe(() => {
  //       this.cancel();
  //       this.router.navigate(['job-card']);
  //       // this.getAllJobs();
  //     })
  //   }
  // }

  filterJobs() {
    if (this.status !== 'all') {
      this.data = this.selectedVehicle ? this.Jobs.filter((d: any) => d.status.toLowerCase() === this.status &&
        (d.registrationNumber === this.selectedVehicle || d.registrationNumber.includes(this.selectedVehicle.split(' ')[0]))) :
        this.Jobs.filter((d: any) => d.status.toLowerCase() === this.status)
    } else {
      this.data = this.selectedVehicle ? this.Jobs.filter((d: any) => d.registrationNumber === this.selectedVehicle || d.registrationNumber.includes(this.selectedVehicle.split(' ')[0])) : this.Jobs
    }
  }

  cancel() {
    this.editJobFlag = false
    this.showNewJobForm = false;
    this.initializeForm();
  }

  filterResults(categoryID: string) {

    if (categoryID) {
      this.data = this.selectedVehicle ?
        this.Jobs.filter((d: any) => d.spareParts.some((s: any) => s.categoryId === categoryID &&
          (d.registrationNumber === this.selectedVehicle || d.registrationNumber.includes(this.selectedVehicle.split(' ')[0])))) :
        this.Jobs.filter((d: any) => d.spareParts.some((s: any) => s.categoryId === categoryID))
      // this.spinner.showSpinner();
      // this.jobService.getJobsByCategory(categoryID).subscribe((res: any) => {
      //   this.spinner.hideSpinner();
      //   this.data = res;
      // });
    } else {
      this.data = this.Jobs
      // this.getAllJobs();
    }
  }

  clearAll() {
    this.mySelect.nativeElement.value = ''
    this.status = 'all';
    this.jobCardNo = ''
    this.selectedVehicle = ''
    this.data = this.Jobs;
  }

  setSelectedJob(id: string, recordNo: number) {
    this.selectedJob = { id, recordNo };
  }
  deleteJob(id: string, recordNo: number) {
    id = this.selectedJob.id;
    recordNo = this.selectedJob.recordNo;
    this.spinner.showSpinner();
    let payload: Job = {
      jobCardNo: '0',
      cardData: []
    };
    this.originalData.forEach(i => {
      if (i._id === id) {
        const index = i.cardData.findIndex((c: any) => c.recordNo === recordNo)
        i.cardData.splice(index, 1);
        payload = i
      }
    })
    this.jobService.updateJob(id, payload).subscribe(() => {
      this.spinner.hideSpinner();
      this.closeModal.nativeElement.click()
      this.getAllJobs();
    });
  }

  importData() {
    this.showFileUpload = true
  }


  onFileChange(event: any) {
    this.files = event.target.files;
    console.log(event);
  }

  uploadFile() {
    console.log(this.files[0])
    this.spinner.showSpinner();
    this.jobService.uploadFile(this.files[0]).subscribe(() => {
      this.getAllJobs();
      this.showFileUpload = false;
      this.files = [];
      this.spinner.hideSpinner();
    })
  }

  exportToExcel(): void {
    /* pass here the table id */
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);

  }
}