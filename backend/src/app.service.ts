import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service.js';

@Injectable()
export class AppService {
  constructor(private readonly supabase: SupabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    return { api: 'ok', supabase: (await this.supabase.ping()) ? 'ok' : 'error' };
  }
}
