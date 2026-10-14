import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  readonly client: SupabaseClient;
  private readonly url: string;
  private readonly key: string;

  constructor(config: ConfigService) {
    this.url = config.getOrThrow<string>('SUPABASE_URL');
    this.key = config.getOrThrow<string>('SUPABASE_KEY');
    this.client = createClient(this.url, this.key);
  }

  // Comprueba que el proyecto de Supabase responde con las credenciales del .env
  async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${this.url}/auth/v1/health`, {
        headers: { apikey: this.key },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
