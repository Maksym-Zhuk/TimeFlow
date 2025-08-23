import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateProfileInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  lastName!: string;
}
