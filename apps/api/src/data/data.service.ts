import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import {
  ContentItem,
  ContentType,
  CreateContentInput,
  Role,
  Subscription,
  SubscriptionPlan,
  UpdateContentInput,
  User,
} from './data.types';
import { UserDocument, UserEntity } from './schemas/user.schema';
import { ContentDocument, ContentEntity } from './schemas/content.schema';
import { TokenDocument, TokenEntity } from './schemas/token.schema';

@Injectable()
export class DataService implements OnModuleInit {
  private readonly plans: SubscriptionPlan[] = [
    { id: 'starter', name: 'Starter Plan', price: 6.99, description: 'Access to core revision kits' },
    { id: 'premium', name: 'Premium Plan', price: 9.99, description: 'All kits, downloads, and support' },
  ];

  constructor(
    @InjectModel(UserEntity.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(ContentEntity.name) private readonly contentModel: Model<ContentDocument>,
    @InjectModel(TokenEntity.name) private readonly tokenModel: Model<TokenDocument>,
  ) {}

  async onModuleInit() {
    await this.ensureAdminUser();
    await this.ensureSeedContent();
  }

  private toUser(doc: UserDocument): User {
    return {
      id: doc.id,
      name: doc.name,
      email: doc.email,
      password: doc.password,
      phone: doc.phone,
      role: doc.role as Role,
      subscription: doc.subscription
        ? {
            planId: doc.subscription.planId,
            status: doc.subscription.status,
            expiresAt: doc.subscription.expiresAt.toISOString(),
          }
        : null,
      library: doc.library ?? [],
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private toContent(doc: ContentDocument): ContentItem {
    return {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      subject: doc.subject,
      price: doc.price,
      previewUrl: doc.previewUrl ?? undefined,
      type: (doc.type as ContentType) ?? 'other',
      lessons: doc.lessons,
      fileId: doc.fileId ?? undefined,
      fileName: doc.fileName ?? undefined,
      fileType: doc.fileType ?? undefined,
      fileSize: doc.fileSize ?? undefined,
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private async ensureAdminUser() {
    const adminExists = await this.userModel.exists({ role: 'admin' });
    if (adminExists) return;

    await this.userModel.create({
      name: 'Admin',
      email: 'admin@mobilelms.com',
      password: 'Admin@123',
      role: 'admin',
    });
  }

  private async ensureSeedContent() {
    const count = await this.contentModel.estimatedDocumentCount();
    if (count > 0) return;

    const samples: CreateContentInput[] = [
      {
        title: 'Mathematics Form 4',
        description: 'Complete revision kit with 200+ solved problems',
        subject: 'Mathematics',
        price: 500,
        previewUrl: 'https://www.africau.edu/images/default/sample.pdf',
        type: 'pdf',
        lessons: 24,
      },
      {
        title: 'Chemistry Form 3',
        description: 'Comprehensive notes and practical questions',
        subject: 'Chemistry',
        price: 450,
        previewUrl: 'https://www.africau.edu/images/default/sample.pdf',
        type: 'pdf',
        lessons: 18,
      },
      {
        title: 'Physics Form 4',
        description: 'Theory and numerical problems with solutions',
        subject: 'Physics',
        price: 0,
        previewUrl: 'https://www.africau.edu/images/default/sample.pdf',
        type: 'pdf',
        lessons: 22,
      },
    ];

    await this.contentModel.insertMany(samples);
  }

  private async attachFreeContentToUser(userId: string) {
    const freeContent = await this.contentModel.find({ price: { $lte: 0 } }, '_id').lean();
    const freeIds = freeContent.map((doc) => doc._id.toString());
    if (freeIds.length === 0) return;

    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { library: { $each: freeIds } } },
      { new: true },
    );
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
  }): Promise<User> {
    const existing = await this.userModel.exists({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('User already exists');
    }
    const doc = await this.userModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      phone: data.phone,
      role: data.role ?? 'student',
    });
    await this.attachFreeContentToUser(doc.id);
    const updated = await this.userModel.findById(doc.id).exec();
    return this.toUser(updated ?? doc);
  }

  async updateUser(user: User, updates: Partial<Pick<User, 'name' | 'phone' | 'password'>>) {
    const updated = await this.userModel
      .findByIdAndUpdate(
        user.id,
        {
          ...(updates.name !== undefined ? { name: updates.name } : {}),
          ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
          ...(updates.password !== undefined ? { password: updates.password } : {}),
        },
        { new: true },
      )
      .exec();
    return updated ? this.toUser(updated) : user;
  }

  async listUsers(): Promise<User[]> {
    const docs = await this.userModel.find().exec();
    return docs.map((doc) => this.toUser(doc));
  }

  async findUserByEmail(email: string) {
    const doc = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    return doc ? this.toUser(doc) : null;
  }

  async findUserById(id: string) {
    const doc = await this.userModel.findById(id).exec();
    return doc ? this.toUser(doc) : null;
  }

  async issueToken(userId: string) {
    const token = uuid();
    await this.tokenModel.create({ token, userId });
    return token;
  }

  async revokeToken(token: string) {
    await this.tokenModel.deleteOne({ token }).exec();
  }

  async findUserByToken(token?: string | null) {
    if (!token) return null;
    const tokenDoc = await this.tokenModel.findOne({ token }).exec();
    if (!tokenDoc) return null;
    return this.findUserById(tokenDoc.userId);
  }

  toPublicUser(user: User) {
    const { password: _password, ...rest } = user;
    return rest;
  }

  async getContent(): Promise<ContentItem[]> {
    const docs = await this.contentModel.find().sort({ createdAt: -1 }).exec();
    return docs.map((doc) => this.toContent(doc));
  }

  async getContentById(id: string) {
    const doc = await this.contentModel.findById(id).exec();
    return doc ? this.toContent(doc) : null;
  }

  async createContent(input: CreateContentInput) {
    const doc = await this.contentModel.create({
      title: input.title,
      description: input.description,
      subject: input.subject,
      price: input.price,
      previewUrl: input.previewUrl,
      type: input.type ?? 'other',
      lessons: input.lessons,
      fileId: input.fileId,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
    });
    if (input.price <= 0) {
      await this.userModel.updateMany({}, { $addToSet: { library: doc.id } }).exec();
    }
    return this.toContent(doc);
  }

  async updateContent(id: string, updates: UpdateContentInput) {
    const doc = await this.contentModel
      .findByIdAndUpdate(
        id,
        {
          ...(updates.title !== undefined ? { title: updates.title } : {}),
          ...(updates.description !== undefined ? { description: updates.description } : {}),
          ...(updates.subject !== undefined ? { subject: updates.subject } : {}),
          ...(updates.price !== undefined ? { price: updates.price } : {}),
          ...(updates.previewUrl !== undefined ? { previewUrl: updates.previewUrl } : {}),
          ...(updates.type !== undefined ? { type: updates.type } : {}),
          ...(updates.lessons !== undefined ? { lessons: updates.lessons } : {}),
          ...(updates.previewUrl !== undefined ? { previewUrl: updates.previewUrl } : {}),
          ...(updates.type !== undefined ? { type: updates.type } : {}),
          ...(updates.fileId !== undefined ? { fileId: updates.fileId } : {}),
          ...(updates.fileName !== undefined ? { fileName: updates.fileName } : {}),
          ...(updates.fileType !== undefined ? { fileType: updates.fileType } : {}),
          ...(updates.fileSize !== undefined ? { fileSize: updates.fileSize } : {}),
        },
        { new: true },
      )
      .exec();
    return doc ? this.toContent(doc) : null;
  }

  async deleteContent(id: string) {
    const doc = await this.contentModel.findByIdAndDelete(id).exec();
    if (!doc) {
      return null;
    }
    await this.userModel.updateMany({}, { $pull: { library: id } }).exec();
    return this.toContent(doc);
  }

  getSubscriptionPlans(): SubscriptionPlan[] {
    return [...this.plans];
  }

  async activateSubscription(user: User, planId: string): Promise<Subscription> {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const allContent = await this.contentModel.find({}, '_id').lean();
    const allIds = allContent.map((doc) => doc._id.toString());
    await this.userModel.findByIdAndUpdate(
      user.id,
      {
        subscription: {
          planId: plan.id,
          status: 'active',
          expiresAt,
        },
        ...(allIds.length ? { $addToSet: { library: { $each: allIds } } } : {}),
      },
      { new: true },
    );
    const subscription: Subscription = {
      planId: plan.id,
      status: 'active',
      expiresAt: expiresAt.toISOString(),
    };
    return subscription;
  }

  async hasAccessToContent(user: User, contentId: string) {
    const item = await this.getContentById(contentId);
    if (!item) return false;
    if (item.price <= 0) return true;
    if (user.subscription?.status === 'active' && new Date(user.subscription.expiresAt) > new Date()) {
      return true;
    }
    return user.library.includes(contentId);
  }

  async getPurchasedContent(user: User) {
    if (!user.library.length) return [];
    const docs = await this.contentModel.find({ _id: { $in: user.library } }).exec();
    return docs.map((doc) => this.toContent(doc));
  }
}