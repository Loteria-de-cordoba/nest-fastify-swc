import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Health')
@Controller('api')
export class HealthController {
  constructor(private readonly cfg: ConfigService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      name: this.cfg.get('APP_NAME', 'nest-template'),
    };
  }
}
