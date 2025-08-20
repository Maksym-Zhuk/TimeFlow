import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfileInfo {
  @Field()
  id!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  description!: string;

  @Field()
  avatarUrl!: string;
}
