const { Header } = require('postman-collection');
const { stringify } = require('querystring');

const {
  collectionVariables,
  request: { headers },
  environment: environmentVariables,
  sendRequest
} = pm;
const bearerToken = collectionVariables.get('bearerToken');
const tokenExpirationDate = collectionVariables.get('tokenExpirationDate');
const username = collectionVariables.get('username');
const password = collectionVariables.get('password');
const authType = environmentVariables.get('authType');

const oAuth2Request = {
  url: 'https://api.oregonstate.edu/oauth2/token',
  method: 'POST',
  header: 'Content-Type:application/x-www-form-urlencoded',
  body: stringify({
    grant_type: 'client_credentials',
    client_id: collectionVariables.get('clientId'),
    client_secret: collectionVariables.get('clientSecret'),
  }),
};

if (authType === 'basic') {
  const token = btoa(`${username}:${password}`);
  headers.add(new Header(`Authorization: Basic ${token}`));
} else if (authType === 'bearer') {
  if (bearerToken && tokenExpirationDate && tokenExpirationDate > new Date().getTime()) {
    headers.add(new Header(`Authorization: Bearer ${bearerToken}`));
  } else {
    console.log('Getting new bearer token');
    sendRequest(oAuth2Request, (err, res) => {
      if (!err && res.code === 200) {
        const response = res.json();
        const newToken = response.access_token;
        const currDate = new Date();
        currDate.setSeconds(currDate.getSeconds() + parseInt(response.expires_in));
        collectionVariables.set('bearerToken', newToken);
        collectionVariables.set('tokenExpirationDate', currDate.getTime());
        headers.add(new Header(`Authorization: Bearer ${newToken}`));
      } else {
        console.log('Could not retrieve OAuth2 token');
        if (err) console.log(err);
        throw new Error(`${res.code}: ${res.status}`);
      }
    });
  }
} else {
  throw new Error(`Unrecognized authType: ${authType}. Valid authTypes are 'bearer' or 'basic'`);
}
