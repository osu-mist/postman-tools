# Postman Tools
Settings and code to make the most of Postman.

## Auto-Authentication Setup
1. Create all the environments you need
    - These can be named anything except for 'LOCAL' which is referenced in the pre-request script
![Open environment settings](images/open-env-settings.png)
2. These environments only need one variable 'URL'
![Local environment example](images/local-env.png)
3. Add the 'URL' variable to the url of all your requests
![URL example](images/url-example.png)
4. Create a top level collection to hold all of the APIs you want to use auto-authentication
![Collection example](images/collection-example.png)
5. Edit the collection and add the following variables. Note the names matter here since they are referenced in the script
    - bearerToken (Can be left blank)
    - tokenExpirationDate (Can be left blank)
    - clientID (oauth2 client ID)
    - clientSecret (oauth2 client secret)
    - username (basic auth username)
    - password (basic auth password)
![collection variables](images/collection-variables.png)
6. Copy 'authentication-pre-request.js' and paste it in the 'Pre-request Scripts' tab
![pre-request scrip](images/pre-request-script.png)
7. Make sure 'Authorization' for all of your requests are set to 'No Auth'. The pre-request script will handle this setting. The easiest way to do this is to set the top level collection to 'No Auth' and leave all others at their default value of 'Inherit auth from parent'.
![authorization example](images/authorization-example.png)
8. Make a request! Check the Postman console if errors occur.
