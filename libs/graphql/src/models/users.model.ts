import { Field, ObjectType } from '@nestjs/graphql';
import { ProfileInfo } from './profileInfo.model';
import { Role } from '@time-flow/shared-backend';

@ObjectType()
export class User {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field(() => Role)
  role!: Role;

  @Field(() => ProfileInfo, { nullable: true })
  profile?: ProfileInfo;
}
