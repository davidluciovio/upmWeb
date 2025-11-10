import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'capture-nav-bar',
  imports: [RouterLink],
  templateUrl: './capture-nav-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'sticky z-10 top-0 w-full bg-base-200 border border-base-300 w-full rounded-lg flex flex-row p-2',
  },
})
export class CaptureNavBar {}
