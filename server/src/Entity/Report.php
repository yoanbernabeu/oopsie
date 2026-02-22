<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\State\ReportIngestProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Index(columns: ['status'], name: 'idx_report_status')]
#[ORM\Index(columns: ['created_at'], name: 'idx_report_created_at')]
#[ORM\Index(columns: ['group_id'], name: 'idx_report_group_id')]
#[ApiResource(
    normalizationContext: ['groups' => ['report:read']],
    denormalizationContext: ['groups' => ['report:write']],
    operations: [
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Get(security: "is_granted('ROLE_USER')"),
        new Post(
            denormalizationContext: ['groups' => ['report:ingest']],
            security: null,
            processor: ReportIngestProcessor::class,
        ),
        new Patch(security: "is_granted('ROLE_USER')"),
        new Delete(security: "is_granted('ROLE_USER')"),
    ]
)]
class Report
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['report:read'])]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(targetEntity: Project::class, inversedBy: 'reports')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['report:read'])]
    private ?Project $project = null;

    #[ORM\Column(type: 'uuid', nullable: true)]
    #[Groups(['report:read'])]
    private ?Uuid $groupId = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['new', 'in_progress', 'resolved', 'closed'])]
    #[Groups(['report:read', 'report:write'])]
    private string $status = 'new';

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'assignedReports')]
    #[Groups(['report:read', 'report:write'])]
    private ?User $assignedTo = null;

    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank]
    #[Groups(['report:read', 'report:ingest'])]
    private ?string $message = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['ui', 'crash', 'performance', 'other'])]
    #[Groups(['report:read', 'report:ingest'])]
    private ?string $category = null;

    #[ORM\Column(length: 20)]
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['low', 'medium', 'high', 'critical'])]
    #[Groups(['report:read', 'report:ingest'])]
    private ?string $severity = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Email]
    #[Groups(['report:read', 'report:ingest'])]
    private ?string $reporterEmail = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['report:read', 'report:ingest'])]
    private ?array $userContext = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['report:read', 'report:ingest'])]
    private ?array $customMetadata = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['report:read', 'report:ingest'])]
    private ?array $deviceInfo = null;

    #[ORM\Column(length: 2048, nullable: true)]
    #[Groups(['report:read', 'report:ingest'])]
    private ?string $pageUrl = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['report:read', 'report:ingest'])]
    private ?array $timeline = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['report:read', 'report:ingest'])]
    private ?array $consoleErrors = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['report:read', 'report:ingest'])]
    private ?array $networkFailures = null;

    #[ORM\Column]
    #[Groups(['report:read', 'report:ingest'])]
    private bool $consentGiven = false;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $searchVector = null;

    #[ORM\Column]
    #[Groups(['report:read'])]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, ReportAttachment> */
    #[ORM\OneToMany(targetEntity: ReportAttachment::class, mappedBy: 'report', cascade: ['persist', 'remove'])]
    #[Groups(['report:read'])]
    private Collection $attachments;

    /** @var Collection<int, ReportComment> */
    #[ORM\OneToMany(targetEntity: ReportComment::class, mappedBy: 'report', cascade: ['remove'])]
    #[Groups(['report:read'])]
    private Collection $comments;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->attachments = new ArrayCollection();
        $this->comments = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;
        return $this;
    }

    public function getGroupId(): ?Uuid
    {
        return $this->groupId;
    }

    public function setGroupId(?Uuid $groupId): static
    {
        $this->groupId = $groupId;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getAssignedTo(): ?User
    {
        return $this->assignedTo;
    }

    public function setAssignedTo(?User $assignedTo): static
    {
        $this->assignedTo = $assignedTo;
        return $this;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(string $message): static
    {
        $this->message = $message;
        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;
        return $this;
    }

    public function getSeverity(): ?string
    {
        return $this->severity;
    }

    public function setSeverity(string $severity): static
    {
        $this->severity = $severity;
        return $this;
    }

    public function getReporterEmail(): ?string
    {
        return $this->reporterEmail;
    }

    public function setReporterEmail(?string $reporterEmail): static
    {
        $this->reporterEmail = $reporterEmail;
        return $this;
    }

    public function getUserContext(): ?array
    {
        return $this->userContext;
    }

    public function setUserContext(?array $userContext): static
    {
        $this->userContext = $userContext;
        return $this;
    }

    public function getCustomMetadata(): ?array
    {
        return $this->customMetadata;
    }

    public function setCustomMetadata(?array $customMetadata): static
    {
        $this->customMetadata = $customMetadata;
        return $this;
    }

    public function getDeviceInfo(): ?array
    {
        return $this->deviceInfo;
    }

    public function setDeviceInfo(?array $deviceInfo): static
    {
        $this->deviceInfo = $deviceInfo;
        return $this;
    }

    public function getPageUrl(): ?string
    {
        return $this->pageUrl;
    }

    public function setPageUrl(?string $pageUrl): static
    {
        $this->pageUrl = $pageUrl;
        return $this;
    }

    public function getTimeline(): ?array
    {
        return $this->timeline;
    }

    public function setTimeline(?array $timeline): static
    {
        $this->timeline = $timeline;
        return $this;
    }

    public function getConsoleErrors(): ?array
    {
        return $this->consoleErrors;
    }

    public function setConsoleErrors(?array $consoleErrors): static
    {
        $this->consoleErrors = $consoleErrors;
        return $this;
    }

    public function getNetworkFailures(): ?array
    {
        return $this->networkFailures;
    }

    public function setNetworkFailures(?array $networkFailures): static
    {
        $this->networkFailures = $networkFailures;
        return $this;
    }

    public function isConsentGiven(): bool
    {
        return $this->consentGiven;
    }

    public function setConsentGiven(bool $consentGiven): static
    {
        $this->consentGiven = $consentGiven;
        return $this;
    }

    public function getSearchVector(): ?string
    {
        return $this->searchVector;
    }

    public function setSearchVector(?string $searchVector): static
    {
        $this->searchVector = $searchVector;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    /** @return Collection<int, ReportAttachment> */
    public function getAttachments(): Collection
    {
        return $this->attachments;
    }

    public function addAttachment(ReportAttachment $attachment): static
    {
        if (!$this->attachments->contains($attachment)) {
            $this->attachments->add($attachment);
            $attachment->setReport($this);
        }
        return $this;
    }

    /** @return Collection<int, ReportComment> */
    public function getComments(): Collection
    {
        return $this->comments;
    }
}
