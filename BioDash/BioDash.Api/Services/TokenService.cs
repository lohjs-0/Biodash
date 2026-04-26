using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BioDash.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace BioDash.Api.Services;

public class TokenService(IConfiguration config)
{
    public string Generate(User user)
    {
        var key      = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Secret"]!));
        var creds    = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var minutes  = int.Parse(config["Jwt:ExpiresInMinutes"]!);
        var issuer   = config["Jwt:Issuer"]!;
        var audience = config["Jwt:Audience"]!;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier,     user.Id.ToString()), // lido com FindFirstValue(ClaimTypes.NameIdentifier)
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()), // conformidade JWT
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name,  user.Name),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddMinutes(minutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}