import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: UserEntity[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as UserEntity;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined;
  });

  it('creates a new user wth a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws error if users signs up with already existing email', async () => {
    await service.signup('suman@mail.com', 'test');
    try {
      await service.signup('suman@mail.com', 'test');
    } catch (error) {
      console.log(error);
    }
  });

  it('throws if signin is called with an unused email', async () => {
    try {
      await service.signin('asdf@mail.com', 'asdffs');
    } catch (error) {
      console.log(error);
    }
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('asdfsd@asdfsd.com', 'password');
    try {
      await service.signin('asdfsd@asdfsd.com', 'asdfasdf');
    } catch (error) {
      console.log(error);
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');
    const user = await service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
