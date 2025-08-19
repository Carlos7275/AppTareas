import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import * as serviceAccount from '../firebase/credenciales.json';

@Injectable()
export class FirebaseService {
  private defaultApp: admin.app.App;

  constructor() {
    this.defaultApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  async sendPushNotification(token: string, title: string, body: string) {
    const message = {
      notification: { title, body },
      token,
    };

    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
