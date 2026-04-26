namespace BioDash.Api.DTOs;

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);