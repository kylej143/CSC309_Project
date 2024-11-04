# Code Template APIs

#### Save(Create) Code Template (USER)

```
POST    ~/api/user/code_templates
RETURN  (201 Code Template) (403 Forbidden) (503 error)

HEADERS: (Authorization, Bearer <<replace with access token>>)

JSON PARAMS

Required parameters:

title: title of code template

explanation: explanation of code template

code: code of code template

tags: list of tags, and tags are strings

```

#### View and Search Code Template (USER/VISITOR)

```
GET    ~/api/user/code_templates
RETURN  (200 Code Template) (503 error)

HEADERS (OPTIONAL): (Authorization, Bearer <<replace with access token>>)

QUERY PARAMS (all optional)

page: number of page want to display (not providing this sets page to 1)

title: title of code template

code: code of code template

tags: list of tags, and tags are strings

NOTE:
Here are the example usages: ~/api/user/code_templates?page=1&title=computer, ~/api/user/code_templates?tags=Python, ~/api/user/code_templates?explanation=I+am+happy
"I am happy" should be I+am+happy

```

#### Edit Code Template (USER)

```
PUT    ~/api/user/code_templates?id=
RETURN  (200 Code Template) (403 Forbidden) (503 error)

HEADERS: (Authorization, Bearer <<replace with access token>>)

QUERY PARAMS (Required)

id: id of code template, for example: ?id=2

JSON PARAMS (all optional)

title: title of code template

explanation: explanation of code template

code: code of code template

tags: list of tags, and tags are strings

```

#### Delete Code Template (USER)

```
DELETE    ~/api/user/code_templates?id=
RETURN  (200 message) (403 Forbidden)

HEADERS: (Authorization, Bearer <<replace with access token>>)

QUERY PARAMS (Required)

id: id of code template, for example: ?id=2

```

#### Fork Code Template (USER/VISITOR)

```
POST    ~/api/user/code_templates?fork=true&id=
RETURN  (200 Code Template) (403 Forbidden) (503 error)

HEADERS (optional): (Authorization, Bearer <<replace with access token>>)

QUERY PARAMS (Required)

id: id of code template, for example: ?id=2

JSON PARAMS (all optional)

title: title of code template

explanation: explanation of code template

code: code of code template

tags: list of tags, and tags are strings

```
