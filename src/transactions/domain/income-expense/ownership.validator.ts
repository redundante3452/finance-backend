import { BadRequestException } from '@nestjs/common';
import { AccountsService } from 'src/accounts/accounts.service';
import { CategoriesService } from 'src/categories/categories.service';
import { Transaction } from 'typeorm';

export class OwnershipValidator {
  constructor(
    private readonly accountService: AccountsService,
    private readonly categoryService: CategoriesService,
  ) {}

  async validateAccountOwnership(accountId: string, userId: string) {
    const account = await this.accountService.findOne(accountId);
    if (!account) throw new BadRequestException('Account not found');
    if (account.userId !== userId)
      throw new BadRequestException('Account does not belong to the user');
    return account;
  }

  async validateCategoryOwnership(categoryId: string, userId: string) {
    const categoryAccount = await this.categoryService.findOne(categoryId);
    if (!categoryAccount) throw new BadRequestException('Category not found');
    if (categoryAccount.userId !== userId)
      throw new BadRequestException('Category does not belong to the user');
    return categoryAccount;
  }
}
