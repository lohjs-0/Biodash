using BioDash.Api.Data.Repositories;
using BioDash.Api.DTOs;
using BioDash.Api.Models;

namespace BioDash.Api.Services;

public class AuthService(IUserRepository userRepo, TokenService tokenService)
{
    public async Task<AuthResponse?> LoginAsync(LoginRequest req)
    {
        var user = await userRepo.GetByEmailAsync(req.Email.Trim().ToLowerInvariant());
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return null;

        return BuildResponse(user);
    }

    public async Task<(AuthResponse? Response, string? Error)> RegisterAsync(RegisterRequest req)
    {
        var normalizedEmail = req.Email.Trim().ToLowerInvariant();

        if (await userRepo.ExistsByEmailAsync(normalizedEmail))
            return (null, "E-mail já cadastrado.");

        var user = new User
        {
            Name         = req.Name.Trim(),
            Email        = normalizedEmail,
            Organization = req.Organization?.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password, workFactor: 12),
        };

        await userRepo.CreateAsync(user);
        return (BuildResponse(user), null);
    }

    private AuthResponse BuildResponse(User user)
    {
        var token = tokenService.Generate(user);
        return new AuthResponse(token, new UserDto(user.Id, user.Name, user.Email, user.Organization));
    }
}