namespace Education.Infrastructure.Data;

using Education.Domain.Entities;
using Education.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public sealed class AppDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
    public DbSet<StoredFile> StoredFiles => Set<StoredFile>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<TodoItem>(entity =>
        {
            entity.ToTable("TodoItems");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<StoredFile>(entity =>
        {
            entity.ToTable("StoredFiles");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.OriginalName).HasMaxLength(255).IsRequired();
            entity.Property(x => x.StoredName).HasMaxLength(255).IsRequired();
            entity.Property(x => x.ContentType).HasMaxLength(128).IsRequired();
            entity.Property(x => x.RelativePath).HasMaxLength(500).IsRequired();
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.Property(x => x.TokenHash).HasMaxLength(256).IsRequired();
            entity.Property(x => x.CreatedByIp).HasMaxLength(64);
            entity.Property(x => x.CreatedByUserAgent).HasMaxLength(512);
            entity.Property(x => x.RevokedByIp).HasMaxLength(64);
            entity.Property(x => x.ReplacedByTokenHash).HasMaxLength(256);
            entity.Property(x => x.DeviceId).HasMaxLength(128);
            entity.HasOne(x => x.User)
                .WithMany(x => x.RefreshTokens)
                .HasForeignKey(x => x.UserId);
        });

        builder.Entity<OutboxMessage>(entity =>
        {
            entity.ToTable("OutboxMessages");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Type).HasMaxLength(256).IsRequired();
            entity.Property(x => x.Payload).IsRequired();
        });
    }
}
