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
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseModule> CourseModules => Set<CourseModule>();
    public DbSet<CourseLesson> CourseLessons => Set<CourseLesson>();
    public DbSet<CourseEnrollment> CourseEnrollments => Set<CourseEnrollment>();
    public DbSet<Deck> Decks => Set<Deck>();
    public DbSet<DeckCard> DeckCards => Set<DeckCard>();
    public DbSet<DeckPurchase> DeckPurchases => Set<DeckPurchase>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<WalletTransaction> WalletTransactions => Set<WalletTransaction>();
    public DbSet<WithdrawalRequest> WithdrawalRequests => Set<WithdrawalRequest>();
    public DbSet<ReputationProfile> ReputationProfiles => Set<ReputationProfile>();

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

        builder.Entity<Course>(entity =>
        {
            entity.ToTable("Courses");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(4000).IsRequired();
            entity.Property(x => x.Category).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Level).HasMaxLength(80).IsRequired();
            entity.Property(x => x.Price).HasColumnType("decimal(18,2)");
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
            entity.HasMany(x => x.Modules)
                .WithOne(x => x.Course)
                .HasForeignKey(x => x.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<CourseModule>(entity =>
        {
            entity.ToTable("CourseModules");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
            entity.HasMany(x => x.Lessons)
                .WithOne(x => x.CourseModule)
                .HasForeignKey(x => x.CourseModuleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<CourseLesson>(entity =>
        {
            entity.ToTable("CourseLessons");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            entity.Property(x => x.ContentType).HasMaxLength(80).IsRequired();
            entity.Property(x => x.ContentUrl).HasMaxLength(1000);
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<CourseEnrollment>(entity =>
        {
            entity.ToTable("CourseEnrollments");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.CompletionRate).HasColumnType("decimal(5,2)");
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
            entity.HasIndex(x => new { x.CourseId, x.StudentId }).IsUnique();
            entity.HasOne(x => x.Course)
                .WithMany(x => x.Enrollments)
                .HasForeignKey(x => x.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Deck>(entity =>
        {
            entity.ToTable("Decks");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(4000).IsRequired();
            entity.Property(x => x.Visibility).HasMaxLength(40).IsRequired();
            entity.Property(x => x.Price).HasColumnType("decimal(18,2)");
            entity.Property(x => x.RatingAverage).HasColumnType("decimal(5,2)");
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
            entity.HasMany(x => x.Cards)
                .WithOne(x => x.Deck)
                .HasForeignKey(x => x.DeckId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(x => x.Purchases)
                .WithOne(x => x.Deck)
                .HasForeignKey(x => x.DeckId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<DeckCard>(entity =>
        {
            entity.ToTable("DeckCards");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.FrontText).HasMaxLength(2000).IsRequired();
            entity.Property(x => x.BackText).HasMaxLength(4000).IsRequired();
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<DeckPurchase>(entity =>
        {
            entity.ToTable("DeckPurchases");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Price).HasColumnType("decimal(18,2)");
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
            entity.HasIndex(x => new { x.DeckId, x.BuyerId }).IsUnique();
        });

        builder.Entity<Wallet>(entity =>
        {
            entity.ToTable("Wallets");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Balance).HasColumnType("decimal(18,2)");
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
            entity.HasIndex(x => x.UserId).IsUnique();
            entity.HasMany(x => x.Transactions)
                .WithOne(x => x.Wallet)
                .HasForeignKey(x => x.WalletId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<WalletTransaction>(entity =>
        {
            entity.ToTable("WalletTransactions");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Type).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            entity.Property(x => x.Description).HasMaxLength(300).IsRequired();
            entity.Property(x => x.ReferenceType).HasMaxLength(80);
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<WithdrawalRequest>(entity =>
        {
            entity.ToTable("WithdrawalRequests");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            entity.Property(x => x.Status).HasMaxLength(30).IsRequired();
            entity.Property(x => x.Note).HasMaxLength(1000);
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<ReputationProfile>(entity =>
        {
            entity.ToTable("ReputationProfiles");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(x => x.IsDeleted).HasDefaultValue(false);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasQueryFilter(x => !x.IsDeleted);
            entity.HasIndex(x => x.UserId).IsUnique();
        });
    }
}
