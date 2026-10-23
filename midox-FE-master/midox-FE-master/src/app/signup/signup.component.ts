import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm:any = FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      isAdmin: [false],
      dob: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(10)]],
      currentFullTimestamp: [''],
    });
  }

  get formControls() {
    return this.signupForm.controls;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }
    const currentFullTimestamp = new Date();
    this.signupForm.patchValue({ currentFullTimestamp });
    console.log(this.signupForm.value);
    this.onClear();
  }

  onClear() {
    this.signupForm.reset();
  }

}
