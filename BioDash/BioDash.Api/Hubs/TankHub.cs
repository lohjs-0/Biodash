using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BioDash.Api.Hubs;

[Authorize]
public class TankHub : Hub
{
    public async Task JoinTank(string tankId)
    {
        if (!int.TryParse(tankId, out _))
            throw new HubException("ID de tank inválido.");

        await Groups.AddToGroupAsync(Context.ConnectionId, $"tank-{tankId}");
    }

    public async Task LeaveTank(string tankId)
    {
        if (!int.TryParse(tankId, out _))
            throw new HubException("ID de tank inválido.");

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"tank-{tankId}");
    }

    private int GetUserId() =>
        int.TryParse(Context.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : throw new HubException("Token inválido.");
}