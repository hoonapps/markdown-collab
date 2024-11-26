import { Module } from '@nestjs/common';
import { CollabModule } from './modules/collab/collab.module';

@Module({
  imports: [CollabModule],
})
export class AppModule {}
