import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'upm-title-page',
  imports: [],
  templateUrl: './titlePage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitlePageComponent {
  titlePage = input<string>('');
  subtitlePage = input<string>('');
 }
