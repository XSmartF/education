namespace Education.Domain.Interfaces;


public interface IFileRepository
{
    Task<IReadOnlyList<StoredFile>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<StoredFile?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(StoredFile file, CancellationToken cancellationToken = default);
    void Update(StoredFile file);
    void Remove(StoredFile file);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
