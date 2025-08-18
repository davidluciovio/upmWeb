import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { TableModule } from 'primeng/table';
import { Button } from "primeng/button";

@Component({
  selector: 'table-users',
  imports: [
    TableModule,
    Button
],
  templateUrl: './tableUsers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableUsersComponent {
  private _userService = inject(UserService);
  //
  //
  public Users$ = rxResource({
    stream: () => this._userService.GetAll()??of([])
  });
  //
}
