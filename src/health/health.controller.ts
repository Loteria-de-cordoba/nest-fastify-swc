import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Health')
@Controller('api')
export class HealthController {
  constructor(private readonly cfg: ConfigService) {}

  @Get('health')
  health() {
    const name = '<project-name>';
    const res = {
      "status": "ok",
      "name": name
    }
    return res;
  }
}
