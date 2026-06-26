import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/User.model';
import { Service } from 'src/models/Service.model';
import { Enquery } from 'src/models/Enquery.model';
import { Profile } from 'src/models/Profile.model';
import { Budget } from 'src/models/Budget.model';
import { Checklist } from 'src/models/Checklist.model';
import { Matchmaker } from 'src/models/Matchmaker.model';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @InjectModel(Service.name) private readonly ServiceModel: Model<Service>,
    @InjectModel(Enquery.name) private readonly EnqueryModel: Model<Enquery>,
    @InjectModel(Profile.name) private readonly ProfileModel: Model<Profile>,
    @InjectModel(Budget.name) private readonly BudgetModel: Model<Budget>,
    @InjectModel(Checklist.name) private readonly ChecklistModel: Model<Checklist>,
    @InjectModel(Matchmaker.name) private readonly MatchmakerModel: Model<Matchmaker>,
  ) {}

  async getAllUsers(role?: string, search?: string) {
    const query: any = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await this.UserModel.find(query).sort({ createdAt: -1 });

    const usersWithProfile = await Promise.all(
      users.map(async (user) => {
        const profile = await this.ProfileModel.findOne({ user: user._id });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          phone_no: profile?.phone_no || '',
          address: profile?.address || '',
          isEmailVerified: profile?.isEmailVerified || false,
          avatar: profile?.avatar?.uri || '',
        };
      }),
    );

    return usersWithProfile;
  }

  async updateUserRole(userId: string, role: string) {
    if (!['user', 'admin', 'vendor'].includes(role)) {
      throw new BadRequestException('Invalid role specified');
    }

    const user = await this.UserModel.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      msg: 'User role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async deleteUser(userId: string) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'admin') {
      throw new BadRequestException('Admin accounts cannot be deleted directly.');
    }

    // Clean up profile
    await this.ProfileModel.deleteOne({ user: userId });

    // Clean up checklist, budget and matchmaking runs
    await this.ChecklistModel.deleteMany({ user: userId });
    await this.BudgetModel.deleteMany({ user: userId });
    await this.MatchmakerModel.deleteMany({ user: userId });

    // Clean up user's own enquiries
    await this.EnqueryModel.deleteMany({ email: user.email.toLowerCase() });

    // Clean up services listed by user (if vendor) and enquiries on those services
    const services = await this.ServiceModel.find({ user: userId }).select('_id');
    const serviceIds = services.map((s) => s._id);
    await this.EnqueryModel.deleteMany({ service: { $in: serviceIds } });
    await this.ServiceModel.deleteMany({ user: userId });

    // Delete user
    await this.UserModel.findByIdAndDelete(userId);

    return { msg: 'User deleted successfully' };
  }

  async getAllServices(search?: string) {
    const query: any = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    return this.ServiceModel.find(query)
      .populate('user', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
  }

  async toggleBlockService(serviceId: string, isAdminBlock: boolean, remark?: string) {
    const service = await this.ServiceModel.findByIdAndUpdate(
      serviceId,
      { isAdminBlock, remark: remark || '' },
      { new: true },
    );

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return {
      msg: `Service ${isAdminBlock ? 'blocked' : 'unblocked'} successfully`,
      service,
    };
  }

  async deleteService(serviceId: string) {
    const service = await this.ServiceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Delete enquiries linked to service
    await this.EnqueryModel.deleteMany({ service: serviceId });

    // Delete service
    await this.ServiceModel.findByIdAndDelete(serviceId);

    return { msg: 'Service deleted successfully' };
  }

  async getAllEnquiries(search?: string) {
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    return this.EnqueryModel.find(query)
      .populate({
        path: 'service',
        select: 'title user budget category',
        populate: [
          { path: 'user', select: 'name email' },
          { path: 'category', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 });
  }

  async deleteEnquiry(enquiryId: string) {
    const enquiry = await this.EnqueryModel.findByIdAndDelete(enquiryId);
    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    return { msg: 'Enquiry deleted successfully' };
  }
}

