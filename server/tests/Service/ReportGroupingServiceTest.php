<?php

declare(strict_types=1);

namespace App\Tests\Service;

use App\Entity\Project;
use App\Entity\Report;
use App\Service\ReportGroupingService;
use PHPUnit\Framework\TestCase;

class ReportGroupingServiceTest extends TestCase
{
    public function testComputeHashReturnsSameHashForSameInputs(): void
    {
        $em = $this->createMock(\Doctrine\ORM\EntityManagerInterface::class);
        $service = new ReportGroupingService($em);

        $project = $this->createMock(Project::class);
        $project->method('getId')->willReturn(\Symfony\Component\Uid\Uuid::v4());

        $report1 = new Report();
        $report1->setProject($project);
        $report1->setPageUrl('https://example.com/page');
        $report1->setConsoleErrors([['message' => 'TypeError: x is undefined']]);
        $report1->setMessage('test');
        $report1->setCategory('crash');
        $report1->setSeverity('high');

        $report2 = new Report();
        $report2->setProject($project);
        $report2->setPageUrl('https://example.com/page');
        $report2->setConsoleErrors([['message' => 'TypeError: x is undefined']]);
        $report2->setMessage('test');
        $report2->setCategory('crash');
        $report2->setSeverity('high');

        $this->assertSame($service->computeHash($report1), $service->computeHash($report2));
    }

    public function testComputeHashReturnsDifferentHashForDifferentInputs(): void
    {
        $em = $this->createMock(\Doctrine\ORM\EntityManagerInterface::class);
        $service = new ReportGroupingService($em);

        $project = $this->createMock(Project::class);
        $project->method('getId')->willReturn(\Symfony\Component\Uid\Uuid::v4());

        $report1 = new Report();
        $report1->setProject($project);
        $report1->setPageUrl('https://example.com/page1');
        $report1->setMessage('test');
        $report1->setCategory('crash');
        $report1->setSeverity('high');

        $report2 = new Report();
        $report2->setProject($project);
        $report2->setPageUrl('https://example.com/page2');
        $report2->setMessage('test');
        $report2->setCategory('crash');
        $report2->setSeverity('high');

        $this->assertNotSame($service->computeHash($report1), $service->computeHash($report2));
    }

    public function testComputeHashReturnsNullWhenNoRelevantData(): void
    {
        $em = $this->createMock(\Doctrine\ORM\EntityManagerInterface::class);
        $service = new ReportGroupingService($em);

        $project = $this->createMock(Project::class);
        $project->method('getId')->willReturn(\Symfony\Component\Uid\Uuid::v4());

        $report = new Report();
        $report->setProject($project);
        $report->setMessage('test');
        $report->setCategory('other');
        $report->setSeverity('low');

        $this->assertNull($service->computeHash($report));
    }
}
