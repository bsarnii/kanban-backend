import { SetMetadata } from '@nestjs/common';

//TODO: Get the value from the environment variable
export const IS_PUBLIC_KEY = 'TEST_PUBLIC_KEY';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
