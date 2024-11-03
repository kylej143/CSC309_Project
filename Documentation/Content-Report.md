# Content Report APIs

#### Report Blog Post (USER)

```
POST    ~/api/user/blog_report
RETURN  (200 reason) (403 Forbidden) (503 errors)

HEADERS: (Authorization, Bearer <<replace with access token>>)

JSON PARAMS

Required parameter:

blogID: id of blog post

Optional parameter:

reason: reason for reporting blog post

```
#### Report Comment (USER)

```
POST    ~/api/user/comment_report
RETURN  (200 reason) (403 Forbidden) (503 errors)

HEADERS: (Authorization, Bearer <<replace with access token>>)

JSON PARAMS

Required parameter:

commentID: id of comment

Optional parameter:

reason: reason for reporting comment

```
#### Sort Blog Posts Based On Number Of Reports In Descending Order (ADMIN)

```
GET    ~/api/admin/sort_blogs
RETURN  (201 blogs) (403 Forbidden) (503 errors)

HEADERS: (Authorization, Bearer <<replace with access token>>)

```
#### Sort Comments Based On Number Of Reports In Descending Order (ADMIN)

```
GET    ~/api/admin/sort_comments
RETURN  (201 comments) (403 Forbidden) (503 errors)

HEADERS: (Authorization, Bearer <<replace with access token>>)

```
#### Hide Blog Post (ADMIN)

```
POST    ~/api/admin/blogs/[id]
RETURN  (200 OK) (401 Unauthorized) (403 Forbidden) (404 Not Found)

HEADERS: (Authorization, Bearer <<replace with access token>>)

```
#### Hide Comment (ADMIN)

```
POST    ~/api/admin/comments/[id]
RETURN  (200 OK) (401 Unauthorized) (403 Forbidden) (404 Not Found)

HEADERS: (Authorization, Bearer <<replace with access token>>)

```
