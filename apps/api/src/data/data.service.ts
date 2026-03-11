import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import {
  AssessmentItem,
  AttemptItem,
  ContentItem,
  CourseItem,
  ContentType,
  CreateAssessmentInput,
  CreateContentInput,
  CreateQuestionInput,
  PaymentItem,
  QuestionItem,
  Role,
  SectionItem,
  Subscription,
  SubscriptionPlan,
  UpdateContentInput,
  User,
} from './data.types';
import { UserDocument, UserEntity } from './schemas/user.schema';
import { ContentDocument, ContentEntity } from './schemas/content.schema';
import { TokenDocument, TokenEntity } from './schemas/token.schema';
import { CourseDocument, CourseEntity } from './schemas/course.schema';
import { SectionDocument, SectionEntity } from './schemas/section.schema';
import { AssessmentDocument, AssessmentEntity } from './schemas/assessment.schema';
import { QuestionDocument, QuestionEntity } from './schemas/question.schema';
import { AttemptDocument, AttemptEntity } from './schemas/attempt.schema';
import { PaymentDocument, PaymentEntity } from './schemas/payment.schema';

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
    @InjectModel(CourseEntity.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(SectionEntity.name) private readonly sectionModel: Model<SectionDocument>,
    @InjectModel(AssessmentEntity.name) private readonly assessmentModel: Model<AssessmentDocument>,
    @InjectModel(QuestionEntity.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(AttemptEntity.name) private readonly attemptModel: Model<AttemptDocument>,
    @InjectModel(PaymentEntity.name) private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async onModuleInit() {
    await this.ensureAdminUser();
    await this.ensureSeedCourses();
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

  private toCourse(doc: CourseDocument): CourseItem {
    return {
      id: doc.id,
      name: doc.name,
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private toSection(doc: SectionDocument): SectionItem {
    return {
      id: doc.id,
      courseId: doc.courseId?.toString() ?? '',
      name: doc.name,
      order: doc.order ?? 0,
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
      courseId: doc.courseId?.toString(),
      sectionId: doc.sectionId?.toString(),
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

  private async ensureSeedCourses() {
    const count = await this.courseModel.estimatedDocumentCount();
    if (count > 0) return;

    const course = await this.courseModel.create({ name: 'CPA' });
    const sectionNames = ['CPA 1', 'CPA 2', 'CPA 3', 'CPA 4', 'CPA 5', 'CPA 6'];
    await this.sectionModel.insertMany(
      sectionNames.map((name, index) => ({
        courseId: course._id,
        name,
        order: index + 1,
      })),
    );
  }

  private async ensureSeedContent() {
    const count = await this.contentModel.estimatedDocumentCount();
    if (count > 0) return;

    const course = await this.courseModel.findOne({ name: 'CPA' }).exec();
    if (!course) return;
    const sections = await this.sectionModel.find({ courseId: course._id }).sort({ order: 1 }).exec();
    if (sections.length === 0) return;

    const samples: Array<CreateContentInput & { courseId: string; sectionId: string }> = [
      {
        title: 'CPA Section 1 - Financial Accounting',
        description: 'Revision kit covering financial statements, accounting standards, and company accounts. Includes worked examples and past paper solutions.',
        subject: 'CPA',
        price: 10,
        previewUrl: 'https://www.africau.edu/images/default/sample.pdf',
        type: 'pdf',
        lessons: 28,
        courseId: course._id.toString(),
        sectionId: sections[0]!._id.toString(),
      },
      {
        title: 'CPA Section 2 - Management Accounting',
        description: 'Cost accounting, budgeting, variance analysis, and decision-making. Complete notes and practice questions for Section 2.',
        subject: 'CPA',
        price: 10,
        previewUrl: 'https://www.africau.edu/images/default/sample.pdf',
        type: 'pdf',
        lessons: 22,
        courseId: course._id.toString(),
        sectionId: sections[1]!._id.toString(),
      },
      {
        title: 'CPA Section 3 - Taxation',
        description: 'Income tax, VAT, and other taxes. Comprehensive coverage of KRA requirements and tax computations with examples.',
        subject: 'CPA',
        price: 10,
        previewUrl: 'https://www.africau.edu/images/default/sample.pdf',
        type: 'pdf',
        lessons: 26,
        courseId: course._id.toString(),
        sectionId: sections[2]!._id.toString(),
      },
      {
        title: 'CPA Section 4 - Auditing and Assurance',
        description: 'Audit planning, evidence, reporting, and professional ethics. Revision kit with case studies and past exam questions.',
        subject: 'CPA',
        price: 0,
        previewUrl: 'https://www.africau.edu/images/default/sample.pdf',
        type: 'pdf',
        lessons: 24,
        courseId: course._id.toString(),
        sectionId: sections[3]!._id.toString(),
      },
      {
        title: 'CPA Section 5 - Strategic Management',
        description: 'Corporate strategy, governance, and risk management. Notes and revision questions for Section 5 exams.',
        subject: 'CPA',
        price: 10,
        previewUrl: 'https://www.africau.edu/images/default/sample.pdf',
        type: 'pdf',
        lessons: 20,
        courseId: course._id.toString(),
        sectionId: sections[4]!._id.toString(),
      },
      {
        title: 'CPA Section 6 - Financial Reporting',
        description: 'Advanced financial reporting, group accounts, and IFRS. Complete revision kit with worked solutions.',
        subject: 'CPA',
        price: 10,
        previewUrl: 'https://www.africau.edu/images/default/sample.pdf',
        type: 'pdf',
        lessons: 30,
        courseId: course._id.toString(),
        sectionId: sections[5]!._id.toString(),
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

  async getCourses(): Promise<CourseItem[]> {
    const docs = await this.courseModel.find().sort({ createdAt: 1 }).exec();
    return docs.map((d) => this.toCourse(d));
  }

  async getCourseById(id: string): Promise<CourseItem | null> {
    const doc = await this.courseModel.findById(id).exec();
    return doc ? this.toCourse(doc) : null;
  }

  async createCourse(name: string): Promise<CourseItem> {
    const doc = await this.courseModel.create({ name });
    return this.toCourse(doc);
  }

  async getSectionsByCourseId(courseId: string): Promise<SectionItem[]> {
    const docs = await this.sectionModel.find({ courseId }).sort({ order: 1 }).exec();
    return docs.map((d) => this.toSection(d));
  }

  async createSection(courseId: string, name: string, order?: number): Promise<SectionItem> {
    const nextOrder =
      order ??
      (await this.sectionModel.countDocuments({ courseId }).exec()) + 1;
    const doc = await this.sectionModel.create({ courseId, name, order: nextOrder });
    return this.toSection(doc);
  }

  async getContentByCourseId(courseId: string): Promise<ContentItem[]> {
    const docs = await this.contentModel.find({ courseId }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toContent(d));
  }

  async getContentBySectionId(sectionId: string): Promise<ContentItem[]> {
    const docs = await this.contentModel.find({ sectionId }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toContent(d));
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
      courseId: input.courseId,
      sectionId: input.sectionId,
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
          ...(updates.courseId !== undefined ? { courseId: updates.courseId } : {}),
          ...(updates.sectionId !== undefined ? { sectionId: updates.sectionId } : {}),
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
    await this.recordPayment(user.id, plan.price, 'subscription', plan.id);
    const subscription: Subscription = {
      planId: plan.id,
      status: 'active',
      expiresAt: expiresAt.toISOString(),
    };
    return subscription;
  }

  private toAttempt(doc: AttemptDocument): AttemptItem {
    return {
      id: doc.id,
      userId: doc.userId?.toString() ?? '',
      assessmentId: doc.assessmentId?.toString() ?? '',
      correctCount: doc.correctCount ?? 0,
      totalQuestions: doc.totalQuestions ?? 0,
      scorePercent: doc.scorePercent ?? 0,
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async createAttempt(
    userId: string,
    assessmentId: string,
    correctCount: number,
    totalQuestions: number,
  ): Promise<AttemptItem> {
    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const doc = await this.attemptModel.create({
      userId,
      assessmentId,
      correctCount,
      totalQuestions,
      scorePercent,
    });
    await this.updateAssessmentAttemptStats(assessmentId);
    return this.toAttempt(doc);
  }

  private async updateAssessmentAttemptStats(assessmentId: string): Promise<void> {
    const attempts = await this.attemptModel.find({ assessmentId }).lean().exec();
    const count = attempts.length;
    const avg =
      count > 0
        ? Math.round(attempts.reduce((s, a) => s + (a.scorePercent ?? 0), 0) / count).toString() + '%'
        : '-';
    await this.assessmentModel
      .findByIdAndUpdate(assessmentId, { attempts: count, avgScore: avg })
      .exec();
  }

  async getAttemptsByAssessmentId(assessmentId: string): Promise<AttemptItem[]> {
    const docs = await this.attemptModel.find({ assessmentId }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toAttempt(d));
  }

  async getAttemptsByUserId(userId: string): Promise<AttemptItem[]> {
    const docs = await this.attemptModel.find({ userId }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toAttempt(d));
  }

  private toPayment(doc: PaymentDocument): PaymentItem {
    return {
      id: doc.id,
      userId: doc.userId?.toString() ?? '',
      amount: doc.amount ?? 0,
      currency: doc.currency ?? 'KES',
      status: doc.status ?? 'completed',
      type: doc.type ?? 'subscription',
      planId: doc.planId,
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async recordPayment(
    userId: string,
    amount: number,
    type: string,
    planId?: string,
  ): Promise<PaymentItem> {
    const doc = await this.paymentModel.create({
      userId,
      amount,
      currency: 'KES',
      status: 'completed',
      type,
      planId,
    });
    return this.toPayment(doc);
  }

  async getPaymentsForAdmin(limit = 100): Promise<PaymentItem[]> {
    const docs = await this.paymentModel.find().sort({ createdAt: -1 }).limit(limit).exec();
    return docs.map((d) => this.toPayment(d));
  }

  async getRevenueSummary(): Promise<{ total: number; count: number; monthTotal: number }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const all = await this.paymentModel.find({ status: 'completed' }).lean().exec();
    const total = all.reduce((s, p) => s + (p.amount ?? 0), 0);
    const monthPayments = all.filter(
      (p) => (p as { createdAt?: Date }).createdAt && new Date((p as { createdAt: Date }).createdAt) >= startOfMonth,
    );
    const monthTotal = monthPayments.reduce((s, p) => s + (p.amount ?? 0), 0);
    return { total, count: all.length, monthTotal };
  }

  async getProgressForAdmin(): Promise<
    { userId: string; name: string; email: string; attemptsCount: number; avgScorePercent: number; lastAttemptAt: string | null }[]
  > {
    const users = await this.userModel.find({ role: 'student' }).lean().exec();
    const attempts = await this.attemptModel.find().lean().exec();
    const byUser = new Map<string, { total: number; sum: number; last: Date | null }>();
    for (const a of attempts) {
      const uid = (a.userId as { toString: () => string })?.toString?.() ?? (a.userId as unknown as string);
      if (!byUser.has(uid)) byUser.set(uid, { total: 0, sum: 0, last: null });
      const rec = byUser.get(uid)!;
      rec.total += 1;
      rec.sum += a.scorePercent ?? 0;
      const createdAt = (a as { createdAt?: Date }).createdAt;
      if (createdAt && (!rec.last || new Date(createdAt) > rec.last)) rec.last = new Date(createdAt);
    }
    return users.map((u) => {
      const uid = u._id?.toString?.() ?? '';
      const rec = byUser.get(uid) ?? { total: 0, sum: 0, last: null };
      const avg = rec.total > 0 ? Math.round(rec.sum / rec.total) : 0;
      return {
        userId: uid,
        name: (u as { name?: string }).name ?? '',
        email: (u as { email?: string }).email ?? '',
        attemptsCount: rec.total,
        avgScorePercent: avg,
        lastAttemptAt: rec.last ? rec.last.toISOString() : null,
      };
    });
  }

  async getAnalyticsForAdmin(): Promise<{
    totalUsers: number;
    totalContent: number;
    totalAttempts: number;
    passRatePercent: number;
    revenueTotal: number;
    revenueMonth: number;
    recentAttempts: AttemptItem[];
  }> {
    const [userCount, contentCount, attemptDocs, revenue, recentAttempts] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.contentModel.countDocuments().exec(),
      this.attemptModel.find().lean().exec(),
      this.getRevenueSummary(),
      this.attemptModel.find().sort({ createdAt: -1 }).limit(10).exec(),
    ]);
    const totalAttempts = attemptDocs.length;
    const passed = attemptDocs.filter((a) => (a.scorePercent ?? 0) >= 70).length;
    const passRatePercent = totalAttempts > 0 ? Math.round((passed / totalAttempts) * 100) : 0;
    return {
      totalUsers: userCount,
      totalContent: contentCount,
      totalAttempts,
      passRatePercent,
      revenueTotal: revenue.total,
      revenueMonth: revenue.monthTotal,
      recentAttempts: recentAttempts.map((d) => this.toAttempt(d as AttemptDocument)),
    };
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

  private toAssessment(doc: AssessmentDocument): AssessmentItem {
    return {
      id: doc.id,
      title: doc.title,
      courseId: doc.courseId?.toString(),
      sectionId: doc.sectionId?.toString(),
      courseName: doc.courseName ?? '',
      sectionName: doc.sectionName ?? '',
      questions: doc.questions,
      timeMinutes: doc.timeMinutes,
      difficulty: doc.difficulty ?? 'Medium',
      attempts: doc.attempts ?? 0,
      avgScore: doc.avgScore ?? '-',
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async getAssessments(): Promise<AssessmentItem[]> {
    const docs = await this.assessmentModel.find().sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toAssessment(d));
  }

  async createAssessment(input: CreateAssessmentInput): Promise<AssessmentItem> {
    const doc = await this.assessmentModel.create({
      title: input.title,
      courseId: input.courseId,
      sectionId: input.sectionId,
      courseName: input.courseName ?? '',
      sectionName: input.sectionName ?? '',
      questions: input.questions,
      timeMinutes: input.timeMinutes,
      difficulty: input.difficulty ?? 'Medium',
    });
    return this.toAssessment(doc);
  }

  async updateAssessment(
    id: string,
    updates: Partial<CreateAssessmentInput>,
  ): Promise<AssessmentItem | null> {
    const doc = await this.assessmentModel
      .findByIdAndUpdate(
        id,
        {
          ...(updates.title !== undefined ? { title: updates.title } : {}),
          ...(updates.courseId !== undefined ? { courseId: updates.courseId } : {}),
          ...(updates.sectionId !== undefined ? { sectionId: updates.sectionId } : {}),
          ...(updates.courseName !== undefined ? { courseName: updates.courseName } : {}),
          ...(updates.sectionName !== undefined ? { sectionName: updates.sectionName } : {}),
          ...(updates.questions !== undefined ? { questions: updates.questions } : {}),
          ...(updates.timeMinutes !== undefined ? { timeMinutes: updates.timeMinutes } : {}),
          ...(updates.difficulty !== undefined ? { difficulty: updates.difficulty } : {}),
        },
        { new: true },
      )
      .exec();
    return doc ? this.toAssessment(doc) : null;
  }

  async deleteAssessment(id: string): Promise<AssessmentItem | null> {
    const doc = await this.assessmentModel.findByIdAndDelete(id).exec();
    if (doc) {
      await this.questionModel.deleteMany({ assessmentId: doc._id }).exec();
    }
    return doc ? this.toAssessment(doc) : null;
  }

  private toQuestion(doc: QuestionDocument): QuestionItem {
    return {
      id: doc.id,
      assessmentId: doc.assessmentId?.toString() ?? '',
      order: doc.order ?? 0,
      questionText: doc.questionText,
      type: (doc.type as 'mcq' | 'true_false') ?? 'mcq',
      options: doc.options ?? [],
      correctIndex: doc.correctIndex ?? 0,
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async getQuestionsByAssessmentId(assessmentId: string): Promise<QuestionItem[]> {
    const docs = await this.questionModel.find({ assessmentId }).sort({ order: 1 }).exec();
    return docs.map((d) => this.toQuestion(d));
  }

  async createQuestion(input: CreateQuestionInput): Promise<QuestionItem> {
    const order =
      input.order ??
      (await this.questionModel.countDocuments({ assessmentId: input.assessmentId }).exec()) + 1;
    const doc = await this.questionModel.create({
      assessmentId: input.assessmentId,
      order,
      questionText: input.questionText,
      type: input.type ?? 'mcq',
      options: input.options ?? [],
      correctIndex: input.correctIndex ?? 0,
    });
    return this.toQuestion(doc);
  }

  async updateQuestion(
    id: string,
    updates: Partial<Pick<CreateQuestionInput, 'questionText' | 'type' | 'options' | 'correctIndex' | 'order'>>,
  ): Promise<QuestionItem | null> {
    const doc = await this.questionModel
      .findByIdAndUpdate(
        id,
        {
          ...(updates.questionText !== undefined ? { questionText: updates.questionText } : {}),
          ...(updates.type !== undefined ? { type: updates.type } : {}),
          ...(updates.options !== undefined ? { options: updates.options } : {}),
          ...(updates.correctIndex !== undefined ? { correctIndex: updates.correctIndex } : {}),
          ...(updates.order !== undefined ? { order: updates.order } : {}),
        },
        { new: true },
      )
      .exec();
    return doc ? this.toQuestion(doc) : null;
  }

  async deleteQuestion(id: string): Promise<QuestionItem | null> {
    const doc = await this.questionModel.findByIdAndDelete(id).exec();
    return doc ? this.toQuestion(doc) : null;
  }
}