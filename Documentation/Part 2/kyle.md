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

### Edit
Through the user's own profile, this page can be accessed.
When the user is edited, it updates the refresh/access token to new ones.

### Refresh token
In _app, there is an infinite loop that will refresh the access token every 500 seconds (~8.3 minutes).