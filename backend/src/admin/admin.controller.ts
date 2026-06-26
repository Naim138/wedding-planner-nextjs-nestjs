import { Controller, UseGuards, Get, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { AdminGuard } from 'src/guards/admin/admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminService } from './admin.service';

@Controller('/api/v1/admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/')
  hello() {
    return 'hello admin';
  }

  @Get('/users')
  async getAllUsers(@Query('role') role?: string, @Query('search') search?: string) {
    return this.adminService.getAllUsers(role, search);
  }

  @Put('/users/role/:id')
  async updateUserRole(@Param('id') userId: string, @Body('role') role: string) {
    return this.adminService.updateUserRole(userId, role);
  }

  @Delete('/users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Get('/services')
  async getAllServices(@Query('search') search?: string) {
    return this.adminService.getAllServices(search);
  }

  @Put('/services/block/:id')
  async toggleBlockService(
    @Param('id') serviceId: string,
    @Body('isAdminBlock') isAdminBlock: boolean,
    @Body('remark') remark?: string,
  ) {
    return this.adminService.toggleBlockService(serviceId, isAdminBlock, remark);
  }

  @Delete('/services/:id')
  async deleteService(@Param('id') serviceId: string) {
    return this.adminService.deleteService(serviceId);
  }

  @Get('/enquiries')
  async getAllEnquiries(@Query('search') search?: string) {
    return this.adminService.getAllEnquiries(search);
  }

  @Delete('/enquiries/:id')
  async deleteEnquiry(@Param('id') enquiryId: string) {
    return this.adminService.deleteEnquiry(enquiryId);
  }
}

