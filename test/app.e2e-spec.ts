import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../src/app.module';
import { SigninDto, SignupDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testUsers = [
    {
      email: 'b.banner@example.com',
      password: 'testpass123',
      firstName: 'Bruce',
      lastName: 'Banner',
      age: 47,
    },
    {
      email: 'b.wayne@example.com',
      password: 'testpass123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      age: 47,
    },
    {
      email: 'c.kent@example.com',
      password: 'testpass123',
      firstName: 'Clark',
      lastName: 'Kent',
      age: 33,
    },
    {
      email: 'c.xavier@example.com',
      password: 'testpass123',
      firstName: 'Charles',
      lastName: 'Xavier',
      age: 62,
    },
    {
      email: 'b.allen@example.com',
      password: 'testpass123',
      firstName: 'Barry',
      lastName: 'Allen',
      age: 25,
    },
    {
      email: 'h.jordan@example.com',
      password: 'testpass123',
      firstName: 'Hal',
      lastName: 'Jordan',
      age: 28,
    },
    {
      email: 'j.bond@example.com',
      password: 'testpass123',
      firstName: 'James',
      lastName: 'Bond',
      age: 47,
    },
    {
      email: 'j.english@example.com',
      password: 'testpass123',
      firstName: 'Johnny',
      lastName: 'English',
      age: 56,
    },
    {
      email: 'f.drebin@example.com',
      password: 'testpass123',
      firstName: 'Frank',
      lastName: 'Drebin',
      age: 63,
    },
    {
      email: 'j.clouseau@example.com',
      password: 'testpass123',
      firstName: 'Jacques',
      lastName: 'Clouseau',
      age: 54,
    },
  ];

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

    await prisma.user.createMany({
      data: testUsers,
    });

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

  describe('Users', () => {
    describe('Get me', () => {
      it('should throw if there is no access_token', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });

      it('should throw if access_token is wrong', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization:
              'Bearer asdjlskjdl.asdasdlasjd.sadasldcvcb',
          })
          .expectStatus(401);
      });

      it('should return current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Get All Users', () => {
      it('should return 2 users', () => {
        return pactum
          .spec()
          .get('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withQueryParams({
            firstName: 'Bruc',
          })
          .expectStatus(200)
          .expectJsonLength('users', 2);
      });

      it('should return 3 users', () => {
        return pactum
          .spec()
          .get('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withQueryParams({
            age: 47,
          })
          .expectStatus(200)
          .expectJsonLength('users', 3);
      });

      it('should return 1 user', () => {
        return pactum
          .spec()
          .get('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withQueryParams({
            firstName: 'Charles',
            lastName: 'X',
          })
          .expectStatus(200)
          .expectJsonLength('users', 1);
      });

      it('should throw when age is not a number', () => {
        return pactum
          .spec()
          .get('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withQueryParams({
            age: 'notnumber',
          })
          .expectStatus(400);
      });
    });

    describe('Edit me', () => {
      const dto: EditUserDto = {
        firstName: 'Peter',
        lastName: 'Parker',
        age: 23,
      };

      it('should update firstName and age', () => {
        return pactum
          .spec()
          .patch('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            firstName: dto.firstName,
            age: dto.age,
          })
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.age)
          .expectBodyContains('Atkinson');
      });

      it('should update firstName, lastName, and age', () => {
        return pactum
          .spec()
          .patch('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName)
          .expectBodyContains(dto.age);
      });
    });
  });
});
