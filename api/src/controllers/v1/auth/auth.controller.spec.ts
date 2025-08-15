import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from 'src/services/auth.service';
import { Utils } from 'src/utils/utils';
import { UnauthorizedException, HttpException } from '@nestjs/common';

describe('AuthController - HTTP Codes', () => {
    let controller: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const mockAuthService = {
            login: jest.fn(),
            me: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
        };

        jest.spyOn(Utils, 'Response').mockImplementation((msg, data) => ({
            message: msg,
            data,
            search: null,
            total: null,
        }));

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('login - 200 OK', async () => {
        (authService.login as jest.Mock).mockResolvedValue('jwt.token');
        const req: any = { user: { id: 1 } };
        const result = await controller.login({ sesionactiva: true } as any, req);
        expect(result).toEqual({
            message: '¡Operación Exitosa!',
            data: { jwt: 'jwt.token' },
            search: null,
            total: null,
        });
    });


    it('me - 200', async () => {
        (authService.me as jest.Mock).mockResolvedValue('data');

        const req: any = { headers: { authorization: 'Bearer old.token' }, user: { id: 1 } };

        const result = await controller.me(req);

        expect(result).toEqual({
            message: '¡Operacion Exitosa!',
            data: 'data',
            search: null,
            total: null,
        });
    });

    it('me - 401 Unauthorized', async () => {
        (authService.me as jest.Mock).mockImplementation(() => {
            throw new UnauthorizedException('Acceso no autorizado');
        });

        const req: any = { user: { id: 1 } };
        await expect(controller.me(req)).rejects.toThrow(UnauthorizedException);
    });

    it('refresh - 403 Forbidden', async () => {
        (authService.refreshToken as jest.Mock).mockImplementation(() => {
            throw new HttpException('Token expirado', 403);
        });

        const req: any = { headers: { authorization: 'Bearer old.token' } };
        const res: any = { cookie: jest.fn(), json: jest.fn() };

        await expect(controller.refresh(req, res)).rejects.toThrow(HttpException);
    });

    it('logout - 200 OK', async () => {
        (authService.logout as jest.Mock).mockResolvedValue(undefined);

        const req: any = { headers: { authorization: 'Bearer token.aqui' } };
        const res: any = { json: jest.fn() };

        await controller.logout(req, res);

        expect(res.json).toHaveBeenCalledWith({
            message: '¡Operacion Exitosa!',
            data: 'Se cerro sesión con exito',
            search: null,
            total: null,
        });
    });

});
