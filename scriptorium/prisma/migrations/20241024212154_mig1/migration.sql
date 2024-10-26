-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" INTEGER NOT NULL DEFAULT 0,
    "phoneNumber" TEXT
);

-- CreateTable
CREATE TABLE "CodeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "explanation" TEXT,
    "code" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "forkID" INTEGER,
    "userID" INTEGER NOT NULL,
    CONSTRAINT "CodeTemplate_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "up" INTEGER NOT NULL DEFAULT 0,
    "down" INTEGER NOT NULL DEFAULT 0,
    "userID" INTEGER NOT NULL,
    CONSTRAINT "Blog_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "up" INTEGER NOT NULL DEFAULT 0,
    "down" INTEGER NOT NULL DEFAULT 0,
    "userID" INTEGER NOT NULL,
    "blogID" INTEGER NOT NULL,
    "parentCommentID" INTEGER,
    CONSTRAINT "Comment_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_blogID_fkey" FOREIGN KEY ("blogID") REFERENCES "Blog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentCommentID_fkey" FOREIGN KEY ("parentCommentID") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CodeTemplateToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CodeTemplateToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "CodeTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CodeTemplateToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_BlogToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BlogToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Blog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlogToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_BlogToCodeTemplate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BlogToCodeTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "Blog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlogToCodeTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "CodeTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tag_key" ON "Tag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "_CodeTemplateToTag_AB_unique" ON "_CodeTemplateToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_CodeTemplateToTag_B_index" ON "_CodeTemplateToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlogToTag_AB_unique" ON "_BlogToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogToTag_B_index" ON "_BlogToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlogToCodeTemplate_AB_unique" ON "_BlogToCodeTemplate"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogToCodeTemplate_B_index" ON "_BlogToCodeTemplate"("B");
