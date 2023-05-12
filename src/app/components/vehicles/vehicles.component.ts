import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Vehicle } from 'src/app/models/vehicle';
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
  constructor(private vehicleSerivce: VehicleService) {
    this.vehicleForm = new FormGroup({
      vehicleNumber: new FormControl(''),
      vehicleType: new FormControl('')
    })
  }
  ngOnInit(): void {
    this.getAllVehicles();
  }

  getAllVehicles() {
    this.vehicleSerivce.getVehicles().subscribe((res: any) => {
      this.data = res;
    });
  }

  initializeForm() {
    this.vehicleForm = new FormGroup({
      vehicleNumber: new FormControl(''),
      vehicleType: new FormControl('')
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
