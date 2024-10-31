# Run APIs

#### Run: Register the user onto the database (USER only)

```
GET    ~/api/user/run
RETURN  (200 stdout/stderr) (500 Server side error)

JSON PARAMS:

stdin (not required): standard input that users can use for their executable.
For example: ./a.out 1 2 3 => stdin: "1 2 3"

language (required): one of the language from c, c++, python, java, javascript

code (required): the actual code content

className (required when language=java): the class name of the main class,
only required when writing with java.
```