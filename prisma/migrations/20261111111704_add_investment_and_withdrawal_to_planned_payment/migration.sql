-- AlterTable
ALTER TABLE `PlannedPayment` ADD COLUMN `addWithdrawal` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `investmentId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `PlannedPayment_investmentId_fkey` ON `PlannedPayment`(`investmentId`);

-- AddForeignKey
ALTER TABLE `PlannedPayment` ADD CONSTRAINT `PlannedPayment_investmentId_fkey` FOREIGN KEY (`investmentId`) REFERENCES `Investment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
