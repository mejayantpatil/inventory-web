import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public user: any = {};
  public currentAddress: any = {};
  public permanantAddress: any = {};

  public personalInfo: FormGroup;
  public currentAddressForm: FormGroup;
  public permanentAddressForm: FormGroup;
  public educationalDetailsForm: FormGroup; 
  public careerDetailsForm: FormGroup;

  public editPersonalInfoFlag: boolean = false;
  public editCurrnetAddressFlag: boolean = false;
  public editPermanantAddressFlag: boolean = false;
  constructor(private activatedRoute: ActivatedRoute, private userService: UserService) {
    // this.initializeForms();
    this.personalInfo = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      fatherName: new FormControl(),
      motherName: new FormControl(''),
      mothersPlace: new FormControl('')
    });

    this.currentAddressForm = new FormGroup({
      city: new FormControl(''),
      tehsil: new FormControl(''),
      district: new FormControl(''),
      state: new FormControl(''),
      country: new FormControl('')
    })

    this.permanentAddressForm = new FormGroup({
      city: new FormControl(''),
      tehsil: new FormControl(''),
      district: new FormControl(''),
      state: new FormControl(''),
      country: new FormControl('')
    })

    this.educationalDetailsForm = new FormGroup({
      hrigherEducation: new FormControl(''),
      university: new FormControl('')
    })

    this.careerDetailsForm = new FormGroup({
      companyName: new FormControl(''),
      position: new FormControl('')
    })
   }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any)=>{
      if (params.id) {
        this.getUser(params.id);
      }
    })
  }

  getUser(id: string) {
    this.user = this.userService.getUser(id);
        this.currentAddress = this.user.currentAddress || {};
        this.initializeForms();
  }

  initializeForms() {
    this.personalInfo = new FormGroup({
      firstName: new FormControl(this.user.firstName),
      lastName: new FormControl(this.user.lastName),
      fatherName: new FormControl(this.user.fatherName),
      motherName: new FormControl(this.user.motherName),
      mothersPlace: new FormControl(this.user.mothersPlace)
    });

    this.currentAddressForm = new FormGroup({
      city: new FormControl(this.currentAddress.city),
      tehsil: new FormControl(this.currentAddress.tehsil),
      district: new FormControl(this.currentAddress.district),
      state: new FormControl(this.currentAddress.state),
      country: new FormControl(this.currentAddress.country)
    })
  }

  editPersonalInfo() {
    this.editPersonalInfoFlag = true;
  }
  updatePersonalInfo() {
    console.log(this.personalInfo);
    this.editPersonalInfoFlag = false;
    this.userService.updateUser(this.user.id||'', {...this.user, ...this.personalInfo.value})
    this.getUser(this.user.id);
  }

  editCurrentAddress() {
    this.editCurrnetAddressFlag = true;
  }
  editParamnantAddress() {
    this.editPermanantAddressFlag = true;
  }

  updateCurrentAddress() {
    this.editCurrnetAddressFlag = false;
    console.log(this.currentAddressForm.value);
    this.userService.updateUser(this.user.id||'', {...this.user, currentAddress: this.currentAddressForm.value})
    this.getUser(this.user.id);
  }

  updatePermanantAddress() {
    this.editPermanantAddressFlag = false;
    this.userService.updateUser(this.user.id||'', {...this.user, currentAddress: this.currentAddressForm.value})
    this.getUser(this.user.id);
  }
}
