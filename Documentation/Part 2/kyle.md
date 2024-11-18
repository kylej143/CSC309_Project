### Register
Register is only available in the nav bar when the user is not logged in.
After registration, the login button will pop up to lead the user to the login page.

### Login
Login is only available when the user is not logged in. 
Logout will only be available when the user is logged in.
Logging in will result in the access/refresh tokens to be stored in localStorage.

### Profile
For the user's own, only available when logged in. Has basic user information.
The user can access the edit button from the profile.
Visitors can look at other people's profile and see non-private information.
Through the route /user/{username}.
