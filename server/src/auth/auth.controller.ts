import { Body, Controller, Post, Req, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string; fullName: string; role: string }) {
    if (!body.email || !body.password || !body.fullName || !body.role) {
      throw new Error('All fields (email, password, fullName, role) are required.');
    }
    return this.authService.register(body);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    return { message: 'Logged out' };
  }

  // --- ROUTE CORRIGÉE ---
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    // Le token JWT contient l'ID de l'utilisateur dans le champ 'sub'.
    // La méthode pour trouver un utilisateur par son ID dans votre service est findOne.
    // Nous nous assurons que l'ID est bien une chaîne de caractères.
    const userId = req.user.sub;
    if (typeof userId === 'string') {
      return this.usersService.findOne(userId);
    }
  }
  // --- FIN DE LA CORRECTION ---

  @Post('password-reset-request')
  async passwordResetRequest(@Body() body: { email: string }) {
    await this.authService.initiatePasswordReset(body.email);
    return { message: 'Password reset link sent if email exists.' };
  }

  @Post('password-reset-confirm')
  async passwordResetConfirm(@Body() body: { token: string; newPassword: string }) {
    await this.authService.confirmPasswordReset(body.token, body.newPassword);
    return { message: 'Password has been reset.' };
  }
}