# User/Admin APIs

#### Register: Register the user onto the database (USER only)

```
POST    ~/api/user/register
RETURN  (200 OK) (405 Not Allowed) (401 Invalid Params)

JSON PARAMS (ASSUME REQUIRED UNLESS OTHERWISE STATED)

username (Unique): string of the username

password: password with a required strength (at least 9 long, 1 Number, 1 Capital)

name: name of the user

email (Unique): email of the form foo@domin

avatar: integer from set (1: pizza, 2: corndog)

phoneNumber (Not Required): phone number in the form XXX XXXX XXXX, must be 11 digits, whitespaces allowed

_ADMIN: ADMIN is only available by changing the role to "ADMIN" from a USER directly form the database (for security).
An admin is created for you through the startup.sh file use (admin1, Admin1psss)
```

#### Login: Login the user/admin onto the database

```
POST    ~/api/user/login
RETURN  (200 Access/Refresh Tokens) (405 Not Allowed) (400 Invalid Params) (401 Unauthorized)

JSON PARAMS (ASSUME REQUIRED UNLESS OTHERWISE STATED)

username: username

password: password for the username
```

#### Refresh: Refresh access token

```
POST    ~/api/user/refresh
RETURN  (200 Access Token) (405 Not Allowed) (400 Invalid Params) (401 Unauthorized)

JSON PARAMS (ASSUME REQUIRED UNLESS OTHERWISE STATED)

refreshToken: string of the refresh token given from login
```

#### Edit: Edit the user onto the database

```
POST    ~/api/user/edit
RETURN  (200 Access/Refresh Tokens) (405 Not Allowed) (401 Invalid Params) (403 Forbidden)

HEADERS: (Authorization, Bearer <<replace with access token>>)
JSON PARAMS (All not required)

username (Unique): new username

password: new password with a required strength (at least 9 long, 1 Number, 1 Capital)

name: new name of the user

email (Unique): new email of the form foo@domin

avatar: integer from set (1: pizza, 2: corndog)

phoneNumber: new phone number in the form XXX XXXX XXXX, must be 11 digits, whitespaces allowed
```

#### Protected_Test: Test API for user authentication of tokens.

```
This is not an actual API for production; it is a test for a internal function for token Auth

POST    ~/api/user/protected_test
RETURN  (200 User Data) (403 Forbidden)

HEADERS: (Authorization, Bearer <<replace with access token>>)
```

#### Protected_Test_ADMIN: Test API for admin authentication of tokens.

```
This is not an actual API for production; it is a test for a internal function for token Auth

POST    ~/api/user/protected_test
RETURN  (200 Admin Data) (403 Forbidden)

HEADERS: (Authorization, Bearer <<replace with access token>>)
```