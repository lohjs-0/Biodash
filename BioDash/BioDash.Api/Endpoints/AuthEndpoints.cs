using BioDash.Api.DTOs;
using BioDash.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace BioDash.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth")
                       .WithTags("Auth");

        group.MapPost("/register", async (
            [FromBody] RegisterRequest req,
            AuthService authService) =>
        {
            var (response, error) = await authService.RegisterAsync(req);
            return error is not null
                ? Results.BadRequest(new { message = error })
                : Results.Created($"/api/auth/register", response);
        })
        .AllowAnonymous()
        .WithSummary("Cadastra um novo usuário");

        group.MapPost("/login", async (
            [FromBody] LoginRequest req,
            AuthService authService) =>
        {
            var response = await authService.LoginAsync(req);
            return response is null
                ? Results.Problem(
                    detail: "Credenciais inválidas.",
                    statusCode: StatusCodes.Status401Unauthorized)
                : Results.Ok(response);
        })
        .AllowAnonymous()
        .WithSummary("Autentica um usuário e retorna o token JWT");
    }
}