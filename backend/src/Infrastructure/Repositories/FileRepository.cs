namespace Education.Infrastructure.Repositories;

using Education.Domain.Entities;
using Education.Domain.Interfaces;
using Education.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public sealed class FileRepository : IFileRepository
{
    private readonly AppDbContext _db;

    public FileRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<StoredFile>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.StoredFiles.AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<StoredFile?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _db.StoredFiles.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task AddAsync(StoredFile file, CancellationToken cancellationToken = default)
    {
        await _db.StoredFiles.AddAsync(file, cancellationToken);
    }

    public void Update(StoredFile file)
    {
        _db.StoredFiles.Update(file);
    }

    public void Remove(StoredFile file)
    {
        _db.StoredFiles.Remove(file);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
