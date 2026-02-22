<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Report;
use App\Entity\ReportAttachment;
use League\Flysystem\FilesystemOperator;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Uid\Uuid;

class AttachmentManager
{
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private const ALLOWED_MIME_TYPES = [
        'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf',
        'text/plain', 'text/csv',
        'application/json',
        'video/mp4', 'video/webm',
    ];

    public function __construct(
        private FilesystemOperator $defaultStorage,
    ) {}

    public function store(UploadedFile $file, Report $report): ReportAttachment
    {
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \InvalidArgumentException('File size exceeds 10MB limit.');
        }

        $mimeType = $file->getMimeType() ?? 'application/octet-stream';
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            throw new \InvalidArgumentException(sprintf('MIME type "%s" is not allowed.', $mimeType));
        }

        $filepath = sprintf(
            'reports/%s/%s_%s',
            $report->getId()->toRfc4122(),
            Uuid::v4()->toRfc4122(),
            $file->getClientOriginalName()
        );

        $stream = fopen($file->getPathname(), 'rb');
        $this->defaultStorage->writeStream($filepath, $stream);
        if (is_resource($stream)) {
            fclose($stream);
        }

        $attachment = new ReportAttachment();
        $attachment->setReport($report);
        $attachment->setFilename($file->getClientOriginalName());
        $attachment->setFilepath($filepath);
        $attachment->setSize($file->getSize());
        $attachment->setMimeType($mimeType);

        return $attachment;
    }

    public function delete(ReportAttachment $attachment): void
    {
        if ($this->defaultStorage->fileExists($attachment->getFilepath())) {
            $this->defaultStorage->delete($attachment->getFilepath());
        }
    }

    public function deleteAllForReport(Report $report): void
    {
        foreach ($report->getAttachments() as $attachment) {
            $this->delete($attachment);
        }
    }
}
