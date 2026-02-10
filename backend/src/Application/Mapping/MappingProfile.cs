namespace Education.Application.Mapping;

using AutoMapper;
using Education.Application.Features.Files.Dtos;
using Education.Application.Features.Todos.Dtos;
using Education.Domain.Entities;

public sealed class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<TodoItem, TodoItemDto>();
        CreateMap<StoredFile, FileItemDto>()
            .ForMember(dest => dest.FileName, opt => opt.MapFrom(src => src.OriginalName));
    }
}
