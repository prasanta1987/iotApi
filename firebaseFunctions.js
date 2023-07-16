const jwt = require('jsonwebtoken');
const axios = require('axios').default

// require('dotenv').config()

// const admin = require('firebase-admin');


// const serviceAccount = {
//   "type": process.env.FB_ADM_type,
//   "project_id": process.env.FB_ADM_project_id,
//   "private_key_id": process.env.FB_ADM_private_key_id,
//   "private_key": process.env.FB_ADM_private_key,
//   "client_email": process.env.FB_ADM_client_email,
//   "client_id": process.env.FB_ADM_client_id,
//   "auth_uri": process.env.FB_ADM_auth_uri,
//   "token_uri": process.env.FB_ADM_token_uri,
//   "auth_provider_x509_cert_url": process.env.FB_ADM_auth_provider_x509_cert_url,
//   "client_x509_cert_url": process.env.FB_ADM_client_x509_cert_url,
//   "universe_domain": process.env.FB_ADM_universe_domain
// }

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: process.env.FB_DB_URL
// });



// var db = admin.database();

// admin.auth().getUserByEmail('prasanta.1987@hotmail.com')
//   .then(data => {
//     console.log(data)
//   })
//   .catch(err => {
//     console.log(err)
//   })



const firebase = require("firebase/app");
const { getDatabase, ref, set, get, child } = require('firebase/database');
const { getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged } = require("firebase/auth");

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  databaseURL: process.env.FB_DB_URL,
};

const fbApp = firebase.initializeApp(firebaseConfig);
const database = getDatabase();
const auth = getAuth();
const dbRef = ref(getDatabase());


exports.FBsignIn = async (req, res) => {

  let userName = req.body.name || false
  let password = req.body.passwd || false

  try {
    const userCredential = await signInWithEmailAndPassword(auth, userName, password)
    res.status(200).json({ "msg": "success" })

  } catch (error) {

    res.status(200).json({ "msg": error })
  }

}




exports.FBsignInArduino = async (req, res) => {

  let userName = req.headers.uname || false;
  let password = req.headers.code || false;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, userName, password)

    res.status(200).send("Login Successfull")

  } catch (error) {

    res.status(401).send("Login Failed")
  }

}

exports.authStateCheck = async (req, res) => {

  const user = await auth.currentUser;

  if (user) {
    res.status(200).json({ "msg": user })
  } else {
    res.status(200).json({ "error": "error" })
  }
}

exports.authApiCall = async (req, res, next) => {

  const user = await auth.currentUser;

  if (user) {
    return next()
  } else {
    res.status(401).send("Unautorized Access")
  }
}

exports.chckLogin = async (req, res, next) => {

  try {
    const user = await auth.currentUser.getIdToken();
    return next()
  } catch (error) {
    res.redirect('/')
  }
}
















































// const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImY5N2U3ZWVlY2YwMWM4MDhiZjRhYjkzOTczNDBiZmIyOTgyZTg0NzUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vaW52ZXN0b2JhYmEiLCJhdWQiOiJpbnZlc3RvYmFiYSIsImF1dGhfdGltZSI6MTY4ODU4MjEwMSwidXNlcl9pZCI6IlI4TWh0NzFBNmtaVGdsa0hqenJNamlpVk1QMTIiLCJzdWIiOiJSOE1odDcxQTZrWlRnbGtIanpyTWppaVZNUDEyIiwiaWF0IjoxNjg4NTgyMTAxLCJleHAiOjE2ODg1ODU3MDEsImVtYWlsIjoicHJhc2FudGEuMTk4N0Bob3RtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJwcmFzYW50YS4xOTg3QGhvdG1haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.l5F8qjC1r8c9DQ9ZBUg643EeTUUDqSBeJzVRn77H84CqM3Q9miYYr_moX_7KbrBfbhNQw6PbaqDStxtPTnrC6ti4nnUMYnwqsX5cRJczTTfBpO5AEOM974SWN2wWdIZP-2x8Dk7X525UX9znK3vBrDDl7cpmm9T0pPX8TOWDSdL32bza38CyaLTa6GkoRf31qcqB12_gMNj2LuYyfguapiQwTNhj-6VMlU6DZ5ektww-Ewh21qXpuTLhnnJakGvNCUY1xsJgV8b3Prv4ntUf4BReIRQTto7Zi6M90n552uD7aNkQ0X-wADezLUE_hIBphnyl1nTYDmjfPYFDrdjxzA";

// const authData = jwt.decode(token, { complete: true });


// jwt.verify(token, authData.signature, function (err, decoded) {
//   if (err) {
//     console.log(err) // bar
//   } else {
//     console.log(decoded) // bar
//   }
// });


// // const cert = {
// //   "f97e7eeecf01c808bf4ab9397340bfb2982e8475": "-----BEGIN CERTIFICATE-----\nMIIDHDCCAgSgAwIBAgIIL1S2MiCVPBowDQYJKoZIhvcNAQEFBQAwMTEvMC0GA1UE\nAwwmc2VjdXJldG9rZW4uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wHhcNMjMw\nNjIzMDkzOTM1WhcNMjMwNzA5MjE1NDM1WjAxMS8wLQYDVQQDDCZzZWN1cmV0b2tl\nbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTCCASIwDQYJKoZIhvcNAQEBBQAD\nggEPADCCAQoCggEBAMh4NWGHmHzy+GZ5aRiV/n+o3hLCTeO4s1AGGjDgz38cwCLf\nATJYaQJ/qe1cCBQwitQh2rMjmLETH4ZWkNfZwqdNgVRVKTJyNgwrW5yG4hxj+ruk\nuihL4RKuSrQDdDP46O5MfrnjickwBgUGt6ITUJ8Qm128aZzfI7Kq8Cyj9RXQ/JFu\nfz3qKgQboRoLySHgHZ20y/eDsvRviwUNlGFbd7yQ3W+R3uX1JnuUPYy+l1QMf5/g\nauDoXKwo7GUe/PdaLyq4NtvzGvbr5YjyjlZEi/6M/gqb9JWpNhOVIsjNMy02z1tt\n+caopWreX4Tf63ixd5BjsscZhAdpt1qZBmTx1D0CAwEAAaM4MDYwDAYDVR0TAQH/\nBAIwADAOBgNVHQ8BAf8EBAMCB4AwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwIwDQYJ\nKoZIhvcNAQEFBQADggEBAFBWuuQ1+YNYw+z7ruUpkSAeNGItsWsnxc3tbUvAD1qf\nq4BQa0RlfCZgAA3VeyhVoqevPbbWNcZrHkcsZmsdIQ/KLdeUjOzcM3p8ulVfYSHA\n3g56THMo+a6u6dKTb7TmkFtPZ3XN7ydX5F5YGveH5xzJQt/HHMdVTm39LgBOy1A3\n/gEg12tCch4BGEB5sp+6WZZkS/N92PSfjp5x7wlc3emfpu5e5HwBV5k98gQQ06QH\nU7GV5W9iCaBk+3MiNMGPqsz4hBqegzkYdT+4njK8+hKzAG25mFMfW5AAXnM/P7zt\nvMzOQXCvY6a2JNQK4GzZud6OU4yXPXfAOM/fwBsr5jw=\n-----END CERTIFICATE-----\n",
// //   "a51bb4bd1d0c61476eb1b70c3a47c316d5f8932b": "-----BEGIN CERTIFICATE-----\nMIIDHTCCAgWgAwIBAgIJAJidaMhPtgPkMA0GCSqGSIb3DQEBBQUAMDExLzAtBgNV\nBAMMJnNlY3VyZXRva2VuLnN5c3RlbS5nc2VydmljZWFjY291bnQuY29tMB4XDTIz\nMDcwMTA5MzkzNloXDTIzMDcxNzIxNTQzNlowMTEvMC0GA1UEAwwmc2VjdXJldG9r\nZW4uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqGSIb3DQEBAQUA\nA4IBDwAwggEKAoIBAQCyaPETX/y3I8AnvqaTTDskohjrOd0wxGdOhdsDvifs6zME\nQoaZkk7Bs3Trc7Akh9w3iGHQw8MVgVA+uyjALgU7480AI8DeWPOOcSDtmAYCuzW/\ncvEb21ZtBofO5W0jye+sAmZUHCRunS1fTiJPlqgy8nDKtXN5dS1vfu3/57S57VS1\n6DphZ+6sh5F/LqtxexnhRAnsxkFfi2YnMvp/nr9YtfLsipFzlW+J9PNdbbB6mzz8\nXU1HdD1ynLRghig8I/T5LG6x1gqKfMfJQPhXxws16ahOx26F6h9HUQz6Op7i95G3\nJcWGb+0WG85l+CjaEcOu7YyiSD+nz1B5hh3BpLb7AgMBAAGjODA2MAwGA1UdEwEB\n/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMCMA0G\nCSqGSIb3DQEBBQUAA4IBAQAMev4UuzLwcpG3kTlBFbVO/280iHqj4EtaLxXAee9Y\nf6y/1sA7cGOxH36LA27WvkjRtjPdlSZZj/k4xc1dwdnEynAYwKQqwjDuvcUMpPEC\nPT4EN0ivyoQN8rmiHUsNfbZxLn1VrMWtnlN8IxZTFAzvxps6uUiFrxG00f64WFKi\nY6f0cRZwm1UvV/eSPq2DOyWQBpHKmpBujQjwSGciPVLLcymj9fVP7G29O3td6OKk\nL5lY6yBY36Hn8bz/tA8OeXD+a66m8K6ESnCsYEP9TWe6HAhCYH9RGqO7ysFWDIaR\nISCms/ZOjyRVXA35w5DBdXN9fyv5q9f5GJNT+2+0l3+S\n-----END CERTIFICATE-----\n"
// // }


// const getCert = async () => {
//   const response = await axios.get("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com")
//   const data = await response.data

//   return data
// }

// (async () => {

//   const cert = await getCert()

//   jwt.verify(token, cert.f97e7eeecf01c808bf4ab9397340bfb2982e8475, function (err, decoded) {
//     if (err) {
//       console.log(err) // bar
//     } else {
//       console.log(decoded) // bar
//     }
//   });

// })();


// const client = jwksClient({

//   jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
//   jwksUri: 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
//   requestHeaders: {}, // Optional
//   timeout: 30000 // Defaults to 30s
// });

// (async () => {

//   const kid = 'f97e7eeecf01c808bf4ab9397340bfb2982e8475';
//   const key = await client.getSigningKey(kid);

//   console.log(key.getPublicKey())
// })();


// 


// exports.checkAuthStatus = () => {
//   return new Promise((resolve, reject) => {
//     try {
//       auth.onAuthStateChanged(user => {
//         resolve(user);
//       });
//     } catch {
//       reject('api failed')
//     }
//   });
// }


// exports.decodingJWT = (token) => {

//   if (token !== null || token !== undefined) {
//     const base64String = token.split(".")[1];
//     const decodedValue = JSON.parse(Buffer.from(base64String, "base64").toString("ascii"));
//     console.log(decodedValue);
//     return decodedValue;
//   }

//   return null;
// }


// createUserWithEmailAndPassword(auth, "prasanta.1987@hotmail.com", "password")
//   .then((userCredential) => {
//     // Signed in
//     const user = userCredential.user;
//     console.log(user)
//     // ...
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // ..
//   });


// signInWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//         // Signed in
//         const user = userCredential.user;
//         console.log(user.uid)
//         // ...
//     })
//     .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//     });


// get(child(dbRef, `users`)).then((snapshot) => {
//     console.log(snapshot.val());
// }).catch((error) => {
//     console.error("===>", error);
// });

const email = "prasanta.1987@hotmail.com";
const password = "password";


// (async () => {
//     const signStat = await signInWithEmailAndPassword(auth, email, password)

//     console.log(await signStat.user.getIdToken())

// })();