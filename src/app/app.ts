import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { PushNotificationService } from './core/services/push-notification';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('unipresSystemWeb_SGAAC');
  
}
