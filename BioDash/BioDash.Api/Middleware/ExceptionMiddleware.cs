using System.Net;
using System.Text.Json;

namespace BioDash.Api.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (status, message) = ex switch
        {
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized,        "Acesso não autorizado."),
            KeyNotFoundException        => (HttpStatusCode.NotFound,            "Recurso não encontrado."),
            ArgumentException           => (HttpStatusCode.BadRequest,          ex.Message),
            InvalidOperationException   => (HttpStatusCode.UnprocessableEntity, ex.Message),
            _                           => (HttpStatusCode.InternalServerError, "Erro interno do servidor.")
        };

        if (status == HttpStatusCode.InternalServerError)
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
        else
            logger.LogWarning("Handled exception [{Status}]: {Message}", (int)status, ex.Message);

        var problem = new
        {
            type     = $"https://httpstatuses.io/{(int)status}",
            title    = status.ToString(),
            status   = (int)status,
            detail   = message,
            traceId  = context.TraceIdentifier,
        };

        context.Response.StatusCode  = (int)status;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem, JsonOptions));
    }
}