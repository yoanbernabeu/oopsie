<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['attachment:read']],
    operations: [
        new Get(security: "is_granted('ROLE_USER')"),
        new GetCollection(
            uriTemplate: '/reports/{reportId}/attachments',
            uriVariables: [
                'reportId' => new Link(fromClass: Report::class, fromProperty: 'attachments'),
            ],
            security: "is_granted('ROLE_USER')",
        ),
    ]
)]
class ReportAttachment
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['attachment:read', 'report:read'])]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(targetEntity: Report::class, inversedBy: 'attachments')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Report $report = null;

    #[ORM\Column(length: 255)]
    #[Groups(['attachment:read', 'report:read'])]
    private ?string $filename = null;

    #[ORM\Column(length: 512)]
    private ?string $filepath = null;

    #[ORM\Column]
    #[Groups(['attachment:read', 'report:read'])]
    private int $size = 0;

    #[ORM\Column(length: 127)]
    #[Groups(['attachment:read', 'report:read'])]
    private ?string $mimeType = null;

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getReport(): ?Report
    {
        return $this->report;
    }

    public function setReport(?Report $report): static
    {
        $this->report = $report;
        return $this;
    }

    public function getFilename(): ?string
    {
        return $this->filename;
    }

    public function setFilename(string $filename): static
    {
        $this->filename = $filename;
        return $this;
    }

    public function getFilepath(): ?string
    {
        return $this->filepath;
    }

    public function setFilepath(string $filepath): static
    {
        $this->filepath = $filepath;
        return $this;
    }

    public function getSize(): int
    {
        return $this->size;
    }

    public function setSize(int $size): static
    {
        $this->size = $size;
        return $this;
    }

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function setMimeType(string $mimeType): static
    {
        $this->mimeType = $mimeType;
        return $this;
    }
}
