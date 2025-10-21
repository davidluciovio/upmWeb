import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private http = inject(HttpClient);
  // Reemplaza esto con tu clave pública VAPID generada
  readonly VAPID_PUBLIC_KEY = "BCCimsAyudYskW1EeayTGOlFIs3j9_YVM4EQW949AhbeDbCgfb4hI-E8qqhMZUD60eVyA-4XAFTIlZqMQn_qpMY";

  constructor(private swPush: SwPush) {}

  /**
   * Solicita al usuario el permiso para recibir notificaciones
   * y se suscribe al servicio de push.
   */
  subscribeToNotifications() {
    // Primero, verificamos si el Service Worker está habilitado
    if (!this.swPush.isEnabled) {
      console.error("Service Worker no está habilitado.");
      return;
    }

    // Solicitamos la suscripción al servicio de push
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      // La suscripción fue exitosa.
      // ¡Aquí es donde enviarías la suscripción (sub) a tu backend!
      console.log("Suscripción exitosa:", sub);
      
      // Ejemplo de cómo enviarías la suscripción a un backend real:
      this.http.post('http://localhost:3000/subscribe', sub).subscribe();

      alert('¡Te has suscrito a las notificaciones!');
    })
    .catch(err => console.error("No se pudo suscribir a las notificaciones", err));
  }
}