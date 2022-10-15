import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../src/app.module';
import { SigninDto, SignupDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      const dto: SignupDto = {
        email: 'r.atkinson@example.com',
        password: 'testpass123',
        firstName: 'Rowan',
        lastName: 'Atkinson',
        age: 67,
      };

      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
            firstName: dto.firstName,
            lastName: dto.lastName,
            age: dto.age,
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            age: dto.age,
          })
          .expectStatus(400);
      });

      it('should throw if firstName is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
            password: dto.password,
            lastName: dto.lastName,
            age: dto.age,
          })
          .expectStatus(400);
      });

      it('should throw if lastName is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
            password: dto.password,
            firstName: dto.firstName,
            age: dto.age,
          })
          .expectStatus(400);
      });

      it('should throw if email is not valid', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'notvalidemail',
            password: dto.password,
            firstName: dto.firstName,
            lastName: dto.lastName,
            age: dto.age,
          })
          .expectStatus(400);
      });

      it('should throw if password length is less than 8', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
            password: 'test12',
            firstName: dto.firstName,
            lastName: dto.lastName,
            age: dto.age,
          })
          .expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });

      it('should throw when email already exists', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });
    });

    describe('Signin', () => {
      const dto: SigninDto = {
        email: 'r.atkinson@example.com',
        password: 'testpass123',
      };

      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw if email is not valid', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'notvalidemail',
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password length is less than 8', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
            password: 'test12',
          })
          .expectStatus(400);
      });

      it('should throw if email is incorrect', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'incorrectemail@example.com',
            password: dto.password,
          })
          .expectStatus(401);
      });

      it('should throw if password is incorrect', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
            password: 'incorrectpassword',
          })
          .expectStatus(401);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
});
