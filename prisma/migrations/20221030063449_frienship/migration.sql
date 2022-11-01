-- CreateTable
CREATE TABLE "friendships" (
    "friendRequestId" INTEGER NOT NULL,
    "friendAcceptId" INTEGER NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("friendRequestId","friendAcceptId")
);

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friendRequestId_fkey" FOREIGN KEY ("friendRequestId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friendAcceptId_fkey" FOREIGN KEY ("friendAcceptId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
