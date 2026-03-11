import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { DataService } from '@/data/data.service';
import { AuthService } from '@/auth/auth.service';

function extractToken(header?: string) {
  if (!header) return undefined;
  const [scheme, value] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') return undefined;
  return value;
}

@Controller('assessments')
export class AssessmentsController {
  constructor(
    private readonly data: DataService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  list() {
    return this.data.getAssessments();
  }

  @Get(':id/questions')
  listQuestions(@Param('id') id: string) {
    return this.data.getQuestionsByAssessmentId(id);
  }

  @Get(':id/attempts')
  async listMyAttempts(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const user = await this.requireAuth(authHeader);
    const attempts = await this.data.getAttemptsByUserId(user.id);
    return attempts.filter((a) => a.assessmentId === id);
  }

  @Post(':id/attempts')
  async submitAttempt(
    @Param('id') id: string,
    @Body()
    body: { answers: Array<{ questionId: string; selectedIndex: number }> },
    @Headers('authorization') authHeader?: string,
  ) {
    const user = await this.requireAuth(authHeader);
    const questions = await this.data.getQuestionsByAssessmentId(id);
    if (!questions.length) {
      throw new BadRequestException('Assessment has no questions');
    }
    const answerMap = new Map(
      (body?.answers ?? []).map((a) => [a.questionId, a.selectedIndex]),
    );
    let correctCount = 0;
    for (const q of questions) {
      const selected = answerMap.get(q.id);
      if (selected !== undefined && selected === q.correctIndex) {
        correctCount++;
      }
    }
    const totalQuestions = questions.length;
    const attempt = await this.data.createAttempt(
      user.id,
      id,
      correctCount,
      totalQuestions,
    );
    return {
      attemptId: attempt.id,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      scorePercent: attempt.scorePercent,
    };
  }

  @Post(':id/questions')
  async addQuestion(
    @Param('id') id: string,
    @Body()
    body: {
      questionText: string;
      type?: 'mcq' | 'true_false';
      options: string[];
      correctIndex: number;
      order?: number;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    await this.assertAdmin(authHeader);
    if (!body?.questionText?.trim()) {
      throw new BadRequestException('questionText is required');
    }
    const options = Array.isArray(body.options) ? body.options : [];
    if (body.type === 'mcq' && options.length < 2) {
      throw new BadRequestException('MCQ must have at least 2 options');
    }
    return this.data.createQuestion({
      assessmentId: id,
      questionText: body.questionText.trim(),
      type: body.type ?? 'mcq',
      options: body.type === 'true_false' ? ['True', 'False'] : options,
      correctIndex: Number(body.correctIndex) ?? 0,
      order: body.order,
    });
  }

  @Put(':id/questions/:qid')
  async updateQuestion(
    @Param('id') id: string,
    @Param('qid') qid: string,
    @Body()
    body: Partial<{ questionText: string; type: string; options: string[]; correctIndex: number; order: number }>,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.assertAdmin(authHeader);
    const updated = await this.data.updateQuestion(qid, {
      ...body,
      type: body.type as 'mcq' | 'true_false' | undefined,
    });
    if (!updated) throw new NotFoundException('Question not found');
    return updated;
  }

  @Delete(':id/questions/:qid')
  async removeQuestion(
    @Param('id') id: string,
    @Param('qid') qid: string,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.assertAdmin(authHeader);
    const deleted = await this.data.deleteQuestion(qid);
    if (!deleted) throw new NotFoundException('Question not found');
    return { success: true };
  }

  @Post()
  async create(
    @Body()
    body: {
      title: string;
      courseId?: string;
      sectionId?: string;
      courseName?: string;
      sectionName?: string;
      questions: number;
      timeMinutes: number;
      difficulty?: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    await this.assertAdmin(authHeader);
    if (!body?.title?.trim()) {
      throw new BadRequestException('title is required');
    }
    return this.data.createAssessment({
      title: body.title.trim(),
      courseId: body.courseId,
      sectionId: body.sectionId,
      courseName: body.courseName,
      sectionName: body.sectionName,
      questions: Number(body.questions) || 10,
      timeMinutes: Number(body.timeMinutes) || 15,
      difficulty: body.difficulty || 'Medium',
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<{ title: string; courseId: string; sectionId: string; courseName: string; sectionName: string; questions: number; timeMinutes: number; difficulty: string }>,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.assertAdmin(authHeader);
    const updated = await this.data.updateAssessment(id, body);
    if (!updated) throw new NotFoundException('Assessment not found');
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    await this.assertAdmin(authHeader);
    const deleted = await this.data.deleteAssessment(id);
    if (!deleted) throw new NotFoundException('Assessment not found');
    return { success: true };
  }

  private async requireAuth(authHeader?: string) {
    const token = extractToken(authHeader);
    if (!token) {
      throw new UnauthorizedException('Authentication required.');
    }
    return this.authService.getUserFromToken(token);
  }

  private async assertAdmin(authHeader?: string) {
    const user = await this.requireAuth(authHeader);
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can perform this action.');
    }
    return user;
  }
}
