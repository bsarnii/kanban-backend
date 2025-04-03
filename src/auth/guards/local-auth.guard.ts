import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Extends the local strategy we defined earlier.
 * Used for authentication with credentials
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
