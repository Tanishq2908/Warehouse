import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm:any = FormGroup;
  constructor(private formBuilder: FormBuilder) { }
  
  ngOnInit() {
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      dob: ['', Validators.required],
      aadhar: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      gender: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      return;
    }
    const currentFullTimestamp = new Date();
    this.profileForm.patchValue({ currentFullTimestamp });
    
    console.log('Profile Form values:', this.profileForm.value);
  }

}
