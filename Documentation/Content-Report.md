# Content Report APIs

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