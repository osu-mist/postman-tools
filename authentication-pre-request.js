const { Header } = require('postman-collection');

const { collectionVariables } = pm;

const oauth2Request = {
    url: 'https://api.oregonstate.edu/oauth2/token',
    method: 'POST',
    header: 'Content-Type:application/x-www-form-urlencoded',
    body:`grant_type=client_credentials&scope=
      &client_id=${collectionVariables.get('clientId')}
      &client_secret=${collectionVariables.get('clientSecret')}`
};

if (pm.environment.name === "LOCAL") {
    const token = btoa(
      `${pm.collectionVariables.get('username')}:${pm.collectionVariables.get('password')}`);
    pm.request.headers.add(new Header("Authorization: Basic " + token));
} else if (pm.collectionVariables.get('bearerToken')
            && pm.collectionVariables.get('tokenExpirationDate')
            && pm.collectionVariables.get('tokenExpirationDate') > new Date().getTime()) {
    pm.request.headers.add(
      new Header(`Authorization: Bearer ${pm.collectionVariables.get('bearerToken')}`));
} else {
    console.log("Getting new bearer token");
    pm.sendRequest(oauth2Request, function (err, res) {
        if (!err && res.code === 200) {
            const response = res.json();
            const currDate = new Date();
            currDate.setSeconds(currDate.getSeconds() + parseInt(response.expires_in));
            pm.collectionVariables.set('bearerToken', response.access_token);
            pm.collectionVariables.set('tokenExpirationDate', currDate.getTime());
            pm.request.headers.add(
              new Header(`Authorization: Bearer ${pm.collectionVariables.get('bearerToken')}`));
        } else {
            console.log("Could not retrieve oauth2 token");
            if (err) console.log(err);
            throw new Error(`${res.code}: ${res.status}`);
        }
    });
}
