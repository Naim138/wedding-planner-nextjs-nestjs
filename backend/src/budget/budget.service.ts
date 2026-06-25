import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Budget } from 'src/models/Budget.model';
import { User } from 'src/models/User.model';
import { CreateBudgetDto, UpdateBudgetDto } from 'src/dto/budget.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(Budget.name) private readonly BudgetModel: Model<Budget>,
    @InjectModel(User.name) private readonly UserModel: Model<User>,
  ) {}

  async getAllBudgets(userId: string) {
    const budgetItems = await this.BudgetModel.find({ user: userId }).sort({ createdAt: 1 });

    if (budgetItems.length === 0) {
      // Pre-populate with standard budget items
      const defaultCategories = [
        { category: 'Venue booking', estimatedCost: 280000 },
        { category: 'Catering per event', estimatedCost: 340000 },
        { category: 'Photography & cinematography', estimatedCost: 95000 },
        { category: 'Stage decor & lighting', estimatedCost: 125000 },
        { category: 'Bride and groom outfits', estimatedCost: 90000 },
        { category: 'Bridal makeup & grooming', estimatedCost: 45000 },
        { category: 'Holud program setup', estimatedCost: 75000 },
        { category: 'Invitations and guest gifts', estimatedCost: 35000 },
      ];

      const budgetsToInsert = defaultCategories.map(item => ({
        user: userId,
        category: item.category,
        estimatedCost: item.estimatedCost,
        actualCost: 0,
        notes: '',
      }));

      await this.BudgetModel.insertMany(budgetsToInsert);
      return this.BudgetModel.find({ user: userId }).sort({ createdAt: 1 });
    }

    return budgetItems;
  }

  async createBudget(userId: string, data: CreateBudgetDto) {
    const newItem = await this.BudgetModel.create({
      user: userId,
      category: data.category,
      estimatedCost: data.estimatedCost || 0,
      actualCost: data.actualCost || 0,
      notes: data.notes || '',
    });
    return newItem;
  }

  async updateBudget(userId: string, id: string, data: UpdateBudgetDto) {
    const updateData: any = {};
    if (data.category !== undefined) updateData.category = data.category;
    if (data.estimatedCost !== undefined) updateData.estimatedCost = data.estimatedCost;
    if (data.actualCost !== undefined) updateData.actualCost = data.actualCost;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updatedItem = await this.BudgetModel.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      throw new NotFoundException('Budget item not found');
    }

    return updatedItem;
  }

  async deleteBudget(userId: string, id: string) {
    const deletedItem = await this.BudgetModel.findOneAndDelete({ _id: id, user: userId });
    if (!deletedItem) {
      throw new NotFoundException('Budget item not found');
    }
    return { msg: 'Budget item deleted successfully' };
  }
}
