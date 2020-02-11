const { Header } = require('postman-collection');

const { collectionVariables, request: { headers } } = pm;
const bearerToken = collectionVariables.get('bearerToken');
const tokenExpirationDate = collectionVariables.get('tokenExpirationDate');
const { environment: environmentName } = pm.environment.name;

const oauth2Request = {
  url: 'https://api.oregonstate.edu/oauth2/token',
  method: 'POST',
  header: 'Content-Type:application/x-www-form-urlencoded',
  body: `grant_type=client_credentials&scope=
      &client_id=${collectionVariables.get('clientId')}
      &client_secret=${collectionVariables.get('clientSecret')}`
};

if (environmentName === 'LOCAL') {
  const token = btoa(
    `${collectionVariables.get('username')}:${collectionVariables.get('password')}`);
  headers.add(new Header(`Authorization: Basic ${token}`));
} else if (bearerToken && tokenExpirationDate && tokenExpirationDate > new Date().getTime()) {
  headers.add(new Header(`Authorization: Bearer ${bearerToken}`));
} else {
  console.log('Getting new bearer token');
  pm.sendRequest(oauth2Request, (err, res) => {
    if (!err && res.code === 200) {
      const response = res.json();
      const newToken = response.access_token;
      const currDate = new Date();
      currDate.setSeconds(currDate.getSeconds() + parseInt(response.expires_in));
      collectionVariables.set('bearerToken', newToken);
      collectionVariables.set('tokenExpirationDate', currDate.getTime());
      headers.add(new Header(`Authorization: Bearer ${newToken}`));
    } else {
      console.log('Could not retrieve oauth2 token');
      if (err) console.log(err);
      throw new Error(`${res.code}: ${res.status}`);
    }
  });
}
