<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Report;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\Uuid;

class ReportGroupingService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function assignGroup(Report $report): void
    {
        $hash = $this->computeHash($report);
        if ($hash === null) {
            return;
        }

        // Look for an existing report with the same hash
        $existing = $this->em->createQueryBuilder()
            ->select('r.groupId')
            ->from(Report::class, 'r')
            ->where('r.project = :project')
            ->andWhere('r.groupId IS NOT NULL')
            ->setParameter('project', $report->getProject())
            ->setMaxResults(1)
            ->getQuery()
            ->getResult();

        // Check existing reports by computing hash on the fly
        $candidates = $this->em->createQueryBuilder()
            ->select('r')
            ->from(Report::class, 'r')
            ->where('r.project = :project')
            ->andWhere('r.pageUrl = :pageUrl')
            ->setParameter('project', $report->getProject())
            ->setParameter('pageUrl', $report->getPageUrl())
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        foreach ($candidates as $candidate) {
            if ($this->computeHash($candidate) === $hash && $candidate->getGroupId() !== null) {
                $report->setGroupId($candidate->getGroupId());
                return;
            }
        }

        // No existing group: create a new one
        $report->setGroupId(Uuid::v4());
    }

    public function computeHash(Report $report): ?string
    {
        $pageUrl = $report->getPageUrl();
        $firstError = null;

        $consoleErrors = $report->getConsoleErrors();
        if (!empty($consoleErrors) && isset($consoleErrors[0]['message'])) {
            $firstError = $consoleErrors[0]['message'];
        }

        if ($pageUrl === null && $firstError === null) {
            return null;
        }

        $projectId = $report->getProject()?->getId()?->toRfc4122() ?? '';

        return hash('sha256', $projectId . '|' . ($pageUrl ?? '') . '|' . ($firstError ?? ''));
    }
}
