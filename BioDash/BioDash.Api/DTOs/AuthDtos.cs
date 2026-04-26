using System.ComponentModel.DataAnnotations;

namespace BioDash.Api.DTOs;

public record RegisterRequest(
    [Required, MinLength(2), MaxLength(100)]
    string Name,

    [Required, EmailAddress, MaxLength(200)]
    string Email,

    [Required, MinLength(8), MaxLength(100)]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
        ErrorMessage = "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número.")]
    string Password,

    [MaxLength(150)]
    string? Organization
);

public record LoginRequest(
    [Required, EmailAddress, MaxLength(200)]
    string Email,

    [Required]
    string Password
);

public record AuthResponse(string Token, UserDto User);

public record UserDto(int Id, string Name, string Email, string? Organization);
