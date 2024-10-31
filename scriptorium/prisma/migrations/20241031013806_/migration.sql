-- CreateTable
CREATE TABLE "BlogRating" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userID" INTEGER NOT NULL,
    "blogID" INTEGER NOT NULL,
    "upvote" BOOLEAN NOT NULL DEFAULT false,
    "downvote" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BlogRating_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BlogRating_blogID_fkey" FOREIGN KEY ("blogID") REFERENCES "Blog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommentRating" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userID" INTEGER NOT NULL,
    "commentID" INTEGER NOT NULL,
    "upvote" BOOLEAN NOT NULL DEFAULT false,
    "downvote" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CommentRating_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommentRating_commentID_fkey" FOREIGN KEY ("commentID") REFERENCES "Comment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reason" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "blogID" INTEGER NOT NULL,
    "commentID" INTEGER NOT NULL,
    CONSTRAINT "ContentReport_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Blog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "up" INTEGER NOT NULL DEFAULT 0,
    "down" INTEGER NOT NULL DEFAULT 0,
    "difference" INTEGER NOT NULL DEFAULT 0,
    "absDifference" INTEGER NOT NULL DEFAULT 0,
    "hide" BOOLEAN NOT NULL DEFAULT false,
    "userID" INTEGER NOT NULL,
    CONSTRAINT "Blog_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Blog" ("content", "down", "flags", "id", "title", "up", "userID") SELECT "content", "down", "flags", "id", "title", "up", "userID" FROM "Blog";
DROP TABLE "Blog";
ALTER TABLE "new_Blog" RENAME TO "Blog";
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "up" INTEGER NOT NULL DEFAULT 0,
    "down" INTEGER NOT NULL DEFAULT 0,
    "difference" INTEGER NOT NULL DEFAULT 0,
    "absDifference" INTEGER NOT NULL DEFAULT 0,
    "hide" BOOLEAN NOT NULL DEFAULT false,
    "userID" INTEGER NOT NULL,
    "blogID" INTEGER NOT NULL,
    "parentCommentID" INTEGER,
    CONSTRAINT "Comment_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_blogID_fkey" FOREIGN KEY ("blogID") REFERENCES "Blog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentCommentID_fkey" FOREIGN KEY ("parentCommentID") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("blogID", "content", "down", "flags", "id", "parentCommentID", "up", "userID") SELECT "blogID", "content", "down", "flags", "id", "parentCommentID", "up", "userID" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" INTEGER NOT NULL DEFAULT 0,
    "phoneNumber" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER'
);
INSERT INTO "new_User" ("avatar", "email", "id", "name", "password", "phoneNumber", "username") SELECT "avatar", "email", "id", "name", "password", "phoneNumber", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BlogRating_userID_blogID_key" ON "BlogRating"("userID", "blogID");

-- CreateIndex
CREATE UNIQUE INDEX "CommentRating_userID_commentID_key" ON "CommentRating"("userID", "commentID");
