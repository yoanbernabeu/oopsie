<?php

declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Project;
use App\Entity\Report;
use App\Service\AttachmentManager;
use App\Service\DomainValidator;
use App\Service\ReportGroupingService;
use App\Service\WebhookService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\RateLimiter\RateLimiterFactory;

class ReportIngestProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private RequestStack $requestStack,
        private DomainValidator $domainValidator,
        private ReportGroupingService $groupingService,
        private WebhookService $webhookService,
        private AttachmentManager $attachmentManager,
        private RateLimiterFactory $reportIngestLimiter,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Report
    {
        assert($data instanceof Report);
        $request = $this->requestStack->getCurrentRequest();

        // Validate API key
        $apiKey = $request?->headers->get('X-Oopsie-Key');
        if (!$apiKey) {
            throw new UnauthorizedHttpException('X-Oopsie-Key', 'Missing API key.');
        }

        $project = $this->em->getRepository(Project::class)->findOneBy(['apiKey' => $apiKey]);
        if (!$project) {
            throw new UnauthorizedHttpException('X-Oopsie-Key', 'Invalid API key.');
        }

        // Validate origin
        $origin = $request->headers->get('Origin') ?? $request->headers->get('Referer') ?? '';
        if (!$this->domainValidator->isAllowed($origin, $project->getAllowedDomains())) {
            throw new AccessDeniedHttpException('Origin not allowed.');
        }

        // Rate limiting
        $limiter = $this->reportIngestLimiter->create($project->getId()->toRfc4122() . '_' . $request->getClientIp());
        if (!$limiter->consume()->isAccepted()) {
            throw new TooManyRequestsHttpException(60, 'Rate limit exceeded.');
        }

        // Validate consent
        if (!$data->isConsentGiven()) {
            throw new BadRequestHttpException('User consent is required.');
        }

        $data->setProject($project);

        // Handle file attachments
        $files = $request->files->all('attachments');
        foreach ($files as $file) {
            $attachment = $this->attachmentManager->store($file, $data);
            $data->addAttachment($attachment);
        }

        // Duplicate detection
        $this->groupingService->assignGroup($data);

        // Build search vector
        $searchParts = array_filter([
            $data->getMessage(),
            $data->getPageUrl(),
            $data->getReporterEmail(),
            $data->getCategory(),
        ]);
        $data->setSearchVector(implode(' ', $searchParts));

        $this->em->persist($data);
        $this->em->flush();

        // Webhook (fire and forget)
        try {
            $this->webhookService->notify($data);
        } catch (\Throwable) {
            // Ignore webhook failures
        }

        return $data;
    }
}
