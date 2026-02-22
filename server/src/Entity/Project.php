<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    normalizationContext: ['groups' => ['project:read']],
    denormalizationContext: ['groups' => ['project:write']],
    operations: [
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Get(security: "is_granted('ROLE_USER')"),
        new Post(security: "is_granted('ROLE_USER')"),
        new Patch(security: "is_granted('ROLE_USER')"),
        new Delete(security: "is_granted('ROLE_USER')"),
    ]
)]
class Project
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['project:read', 'report:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['project:read', 'project:write', 'report:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 64, unique: true)]
    #[Groups(['project:read'])]
    private ?string $apiKey = null;

    #[ORM\Column(type: 'json')]
    #[Groups(['project:read', 'project:write'])]
    private array $allowedDomains = ['*'];

    #[ORM\Column(length: 2048, nullable: true)]
    #[Assert\Url]
    #[Groups(['project:read', 'project:write'])]
    private ?string $webhookUrl = null;

    #[ORM\Column]
    #[Assert\Positive]
    #[Groups(['project:read', 'project:write'])]
    private int $retentionDays = 90;

    #[ORM\Column]
    #[Groups(['project:read'])]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, Report> */
    #[ORM\OneToMany(targetEntity: Report::class, mappedBy: 'project', cascade: ['remove'])]
    private Collection $reports;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->reports = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function generateApiKey(): void
    {
        if ($this->apiKey === null) {
            $this->apiKey = 'osk_' . bin2hex(random_bytes(24));
        }
    }

    public function regenerateApiKey(): void
    {
        $this->apiKey = 'osk_' . bin2hex(random_bytes(24));
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getApiKey(): ?string
    {
        return $this->apiKey;
    }

    public function getAllowedDomains(): array
    {
        return $this->allowedDomains;
    }

    public function setAllowedDomains(array $allowedDomains): static
    {
        $this->allowedDomains = $allowedDomains;
        return $this;
    }

    public function getWebhookUrl(): ?string
    {
        return $this->webhookUrl;
    }

    public function setWebhookUrl(?string $webhookUrl): static
    {
        $this->webhookUrl = $webhookUrl;
        return $this;
    }

    public function getRetentionDays(): int
    {
        return $this->retentionDays;
    }

    public function setRetentionDays(int $retentionDays): static
    {
        $this->retentionDays = $retentionDays;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    /** @return Collection<int, Report> */
    public function getReports(): Collection
    {
        return $this->reports;
    }
}
