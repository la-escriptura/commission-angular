import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const ADMIN_EMAIL = 'aguilar_chris@yahoo.com';

exports.addUser = functions.auth.user().onCreate(
	(user: admin.auth.UserRecord) => admin.auth().setCustomUserClaims(user.uid, 
		{
			"roles": user.email === ADMIN_EMAIL ? ['ADMIN'] : ['USER']
		}
	).catch((e: string) => console.error(e))
);
