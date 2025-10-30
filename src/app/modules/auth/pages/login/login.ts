import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from "@angular/forms";

import { Password } from "primeng/password";
import { InputText } from "primeng/inputtext";
import { Button } from "primeng/button";
import { ToastModule } from "primeng/toast";

import { Authentication, loginRequest } from '../../services/authentication';
@Component({
  selector: 'app-login',
  imports: [Password, InputText, Button, FormsModule, ToastModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login { 
  private authentication = inject(Authentication);

  public user = signal('');
  public password = signal('');

  constructor() {}

  login(): void {
    console.log("hola");
    
    const loginRequest: loginRequest = {
      codeUser: this.user(),
      password: this.password(),
    };
    console.log(loginRequest);

    this.authentication.login(loginRequest);

    

  }

}
