import { Injectable, Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from './authentication.service';

export interface DialogData {
    descripcion: string;
    token: string;
  }

@Component({
selector: 'dialog-request-auth',
templateUrl: './requestauth.html'
})
export class DialogRequestAuthComponent {
  reactiveForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<DialogRequestAuthComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData, private fb: FormBuilder, private auth: AuthenticationService) {
    this.reactiveForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }
  login() {
    this.auth.requestAuth(this.reactiveForm.value).subscribe((result) => {
      this.data.token = result.token;
      this.dialogRef.close(result.token);
    }, (err) => {
      alert(err);
      this.dialogRef.close();
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}



@Injectable()
export class RequestAuthService {
    callback?: (res?: string) => void;

    constructor(private dialog: MatDialog) { }


  openDialog(descripcion: string, callback: (res?: string) => void): void {
    this.callback = callback;
    const dialogRef = this.dialog.open(DialogRequestAuthComponent, {
      width: '80%',
      maxWidth: '400px',
      data: {descripcion},
    });
    dialogRef.afterClosed().subscribe(result => {
      callback(result);
    });
  }

}