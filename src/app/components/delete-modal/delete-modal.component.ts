import { Component, ViewChild } from '@angular/core';
import { ConfirmModalService } from 'src/app/services/confirm-modal.service';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss']
})
export class DeleteModalComponent {
  @ViewChild('modal') modal: any;
  constructor(public service: ConfirmModalService) {

  }


}
