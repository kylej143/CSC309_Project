# Blog APIs

#### Create Blog Post (USER)

```
POST    ~/api/user/blogs
RETURN  (201 Created) (401 Unauthorized) (403 Forbidden)

HEADERS: (Authorization, Bearer <<replace with access token>>)

JSON PARAMS

Required parameters:

title: title of blog post

content: content of blog post

Optional parameters:

tags: list of tags, and tags are strings

templates: list of code templates, and code templates represented by their ids (integer)
```

#### Edit Blog Post (USER)

```
PUT    ~/api/user/blogs/[blogID]
RETURN  (200 OK) (401 Unauthorized) (403 Forbidden) (404 Not Found)

HEADERS: (Authorization, Bearer <<replace with access token>>)

JSON PARAMS (all optional)

title: title of blog post

content: content of blog post

tags: list of tags, and tags are strings

templates: list of code templates, and code templates represented by their ids (integer)

NOTE:
The blog post to be edited is specified by its id, [blogID].
The blog must be authored by the user in order for them to edit it. 
If the blog has been hidden by the administrator, the user cannot edit it.

```

#### Delete Blog Post (USER)

```
PUT    ~/api/user/blogs/[blogID]
RETURN  (200 OK) (401 Unauthorized) (403 Forbidden) (404 Not Found)

HEADERS: (Authorization, Bearer <<replace with access token>>)

NOTE:
The blog post to be deleted is specified by its id, [blogID].
The blog must be authored by the user in order for them to delete it. 
If the blog has been hidden by the administrator, the user cannot delete it.

```

#### Search and Sort Blog Posts (VISITOR/USER)

```
GET    ~/api/user/blogs
RETURN  (200 OK) (403 Forbidden)

HEADERS (OPTIONAL): (Authorization, Bearer <<replace with access token>>)

QUERY PARAMS (all optional)

title: title of blog post (partial match)

content: content of blog post (partial match)

tags: a tag string

templates: a template id (number)

sort: sort method - can be valued, controversial, or recent

page: page number, default is 1

NOTE:
Each tag and template is specified separately (e.g. ~/api/user/blogs?tags=javascript&tags=react&tags=hello).
Blogs that have been hidden by the administrator will not appear, except to the author and administrator when they are logged in.

```

#### Get Individual Blog Post (VISITOR/USER)

```
GET    ~/api/user/blogs/[blogID]
RETURN  (200 OK) (403 Forbidden) (404 Not Found)

HEADERS (OPTIONAL): (Authorization, Bearer <<replace with access token>>)

NOTE:
A blog that has been hidden by the administrator will not appear, except to the author and administrator when they are logged in.

```

#### Add Comment or Reply to Existing Comment (USER)

```
POST    ~/api/user/blogs/[blogID]/comments
RETURN  (201 Created) (401 Unauthorized) (403 Forbidden) (404 Not Found)

HEADERS: (Authorization, Bearer <<replace with access token>>)

JSON PARAMS

Required parameters:

content: content of comment

Optional parameters:

parentCommentID: ID of existing comment to respond to. This comment must also be in the blog specified by [blogID].
```

#### Get and Sort Comments of Blog (VISITOR/USER)

```
GET    ~/api/user/blogs/[blogID]/comments
RETURN  (200 OK) (403 Forbidden)

HEADERS (OPTIONAL): (Authorization, Bearer <<replace with access token>>)

QUERY PARAMS (optional)

sort: sort method - can be valued, controversial, or recent

page: page number, default is 1

NOTE:
Comments that have been hidden by the administrator will not appear, except to the author and administrator when they are logged in.

```

#### Upvote/Downvote Blog Post (USER)

```
PUT    ~/api/user/blogs/[blogID]
RETURN  (200 OK) (201 Created) (401 Unauthorized) (403 Forbidden) (404 Not Found)

HEADERS: (Authorization, Bearer <<replace with access token>>)

JSON PARAMS

upvote: true or false
downvote: true or false

NOTE:
A blog that has been hidden by the administrator cannot be upvoted or downvoted.

```

#### Upvote/Downvote Comment (USER)

```
PUT    ~/api/user/blogs/[blogID]/comments/[commentID]
RETURN  (200 OK) (201 Created) (401 Unauthorized) (403 Forbidden) (404 Not Found)

HEADERS: (Authorization, Bearer <<replace with access token>>)

JSON PARAMS

upvote: true or false
downvote: true or false

NOTE:
The comment specified by [commentID] must be associated with the blog specified by [blogID].
A comment that has been hidden by the administrator cannot be upvoted or downvoted.

```

