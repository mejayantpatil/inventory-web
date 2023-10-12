import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Job } from 'src/app/models/jobs';
import { Transaction } from 'src/app/models/transactions';
import { Vehicle } from 'src/app/models/vehicle';
import { JobService } from 'src/app/services/jobs.service';
import { TransactionService } from 'src/app/services/transactions.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent {
  private fileName: string = 'Vehicles Data ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public data: any[] = [];
  public vehicle: any = {};
  public showNewVehicleForm: boolean = false;
  public vehicleForm: FormGroup;
  public editVehicleFlag: boolean = false;
  public jobs: Job[] = [];
  public kmByBusNo: any = {};
  constructor(private vehicleSerivce: VehicleService, private jobService: JobService) {
    this.vehicleForm = new FormGroup({
      vehicleNumber: new FormControl('', Validators.required),
      vehicleType: new FormControl('', Validators.required),
      currentKM: new FormControl(''),
      oilChange: new FormControl(''),
      service: new FormControl('')
    })
  }
  ngOnInit(): void {
    this.getAllVehicles();
    this.getJobs();
  }

  getJobs() {
    this.jobService.getJobs().subscribe((res: any) => {
      this.jobs = res;
      // this.jobs.forEach(j => {
      //   if (j.cardData[0]) {
      //     const km = this.kmByBusNo[j.cardData[0].registrationNumber] < j.cardData[0].kmCovered ?
      //       j.cardData[0].kmCovered : this.kmByBusNo[j.cardData[0].registrationNumber];
      //     this.kmByBusNo[j.cardData[0].registrationNumber] = km ? km : 0;
      //     // this.kmByBusNo[j.cardData[0].registrationNumber] = j.cardData[0].kmCovered;
      //   }
      // })
    })
  }

  getAllVehicles() {
    this.vehicleSerivce.getVehicles().subscribe((res: any) => {
      this.data = res;
    });
  }

  initializeForm() {
    this.vehicleForm = new FormGroup({
      vehicleNumber: new FormControl('', Validators.required),
      vehicleType: new FormControl('', Validators.required),
      currentKM: new FormControl(''),
      oilChange: new FormControl('No'),
      service: new FormControl('No')
    })
  }
  newVehicle() {
    this.editVehicleFlag = true
    this.showNewVehicleForm = true
  }

  editVehicle(vehicle: Vehicle) {
    this.editVehicleFlag = true;
    this.showNewVehicleForm = true;
    this.vehicleForm = new FormGroup({
      vehicleNumber: new FormControl(vehicle.vehicleNumber),
      vehicleType: new FormControl(vehicle.vehicleType),
      currentKM: new FormControl(vehicle.currentKM),
      oilChange: new FormControl(vehicle.oilChange),
      service: new FormControl(vehicle.service),
      _id: new FormControl(vehicle._id)
    })
  }

  saveVehicle(vehicle: Vehicle) {
    if (this.vehicleForm.valid && vehicle._id) {
      this.vehicleSerivce.updateVehicle(vehicle._id, this.vehicleForm.value).subscribe(res => {
        this.cancel();
        this.getAllVehicles();
      })
    } else if (this.vehicleForm.valid) {
      this.vehicleSerivce.saveVehicle(this.vehicleForm.value).subscribe(res => {
        this.cancel();
        this.getAllVehicles();
      })
    }
  }

  cancel() {
    this.editVehicleFlag = false
    this.showNewVehicleForm = false;
    this.initializeForm();
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
