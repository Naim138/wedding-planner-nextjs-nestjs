import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Checklist } from 'src/models/Checklist.model';
import { User } from 'src/models/User.model';
import { CreateChecklistDto, UpdateChecklistDto } from 'src/dto/checklist.dto';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectModel(Checklist.name) private readonly ChecklistModel: Model<Checklist>,
    @InjectModel(User.name) private readonly UserModel: Model<User>,
  ) {}

  async getAllChecklists(userId: string) {
    const checklistItems = await this.ChecklistModel.find({ user: userId }).sort({ createdAt: 1 });

    if (checklistItems.length === 0) {
      // Pre-populate with standard wedding planning tasks
      const defaultTasks = [
        { title: 'Select a wedding theme/style', category: 'General' },
        { title: 'Set a target wedding budget', category: 'General' },
        { title: 'Create a rough guest list draft', category: 'General' },
        { title: 'Select and book wedding venue', category: 'Venue' },
        { title: 'Book a catering service', category: 'Catering' },
        { title: 'Book a wedding photographer', category: 'General' },
        { title: 'Choose wedding dress and suits', category: 'Attire' },
        { title: 'Select a decorator/florist', category: 'General' },
        { title: 'Finalize catering menu', category: 'Catering' },
        { title: 'Send out RSVP invitations', category: 'General' },
      ];

      const tasksToInsert = defaultTasks.map(task => ({
        user: userId,
        title: task.title,
        category: task.category,
        completed: false,
      }));

      await this.ChecklistModel.insertMany(tasksToInsert);
      return this.ChecklistModel.find({ user: userId }).sort({ createdAt: 1 });
    }

    return checklistItems;
  }

  async createChecklist(userId: string, data: CreateChecklistDto) {
    const newItem = await this.ChecklistModel.create({
      user: userId,
      title: data.title,
      category: data.category || 'General',
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      completed: false,
    });
    return newItem;
  }

  async updateChecklist(userId: string, id: string, data: UpdateChecklistDto) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const updatedItem = await this.ChecklistModel.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      throw new NotFoundException('Checklist item not found');
    }

    return updatedItem;
  }

  async deleteChecklist(userId: string, id: string) {
    const deletedItem = await this.ChecklistModel.findOneAndDelete({ _id: id, user: userId });
    if (!deletedItem) {
      throw new NotFoundException('Checklist item not found');
    }
    return { msg: 'Checklist item deleted successfully' };
  }
}
