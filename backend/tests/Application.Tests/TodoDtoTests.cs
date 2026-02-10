using Education.Application.Features.Todos.Dtos;
using FluentAssertions;
using Xunit;

namespace Education.Application.Tests;

public sealed class TodoDtoTests
{
    [Fact]
    public void CreateTodoRequest_ShouldHoldTitle()
    {
        var dto = new CreateTodoRequest("Learn .NET");

        dto.Title.Should().Be("Learn .NET");
    }
}
