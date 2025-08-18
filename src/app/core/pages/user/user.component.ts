import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TitlePageComponent } from "../../../shared/titlePage/titlePage.component";
import { TableUsersComponent } from "./tableUsers/tableUsers.component";
import { FormAddUserComponent } from "./formAddUser/formAddUser.component";

@Component({
  selector: 'app-user',
  imports: [TitlePageComponent, TableUsersComponent, FormAddUserComponent],
  templateUrl: './user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UserComponent { }
