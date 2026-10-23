import { Component, Inject, Optional } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-msg-dialog',
  templateUrl: './msg-dialog.component.html',
  styleUrls: ['./msg-dialog.component.scss']
})
export class MsgDialogComponent {
  constructor(@Optional() public dialogRef: MatDialogRef<MsgDialogComponent>, @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    
    }
    okClick(): void {
      this.dialogRef.close();
    }
}
