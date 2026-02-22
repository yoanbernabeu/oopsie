<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Report;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WebhookService
{
    public function __construct(
        private HttpClientInterface $httpClient,
    ) {}

    public function notify(Report $report): void
    {
        $project = $report->getProject();
        if ($project === null || $project->getWebhookUrl() === null) {
            return;
        }

        $payload = [
            'event' => 'report.created',
            'project' => [
                'id' => $project->getId()->toRfc4122(),
                'name' => $project->getName(),
            ],
            'report' => [
                'id' => $report->getId()->toRfc4122(),
                'message' => $report->getMessage(),
                'category' => $report->getCategory(),
                'severity' => $report->getSeverity(),
                'page_url' => $report->getPageUrl(),
                'reporter_email' => $report->getReporterEmail(),
                'created_at' => $report->getCreatedAt()->format(\DateTimeInterface::ATOM),
            ],
        ];

        // Fire and forget
        $this->httpClient->request('POST', $project->getWebhookUrl(), [
            'json' => $payload,
            'timeout' => 5,
        ]);
    }
}
