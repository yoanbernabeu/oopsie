<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Project;
use App\Entity\Report;
use App\Service\AttachmentManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'oopsie:purge-expired',
    description: 'Delete reports older than their project retention period',
)]
class PurgeExpiredReportsCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private AttachmentManager $attachmentManager,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $totalDeleted = 0;

        $projects = $this->em->getRepository(Project::class)->findAll();

        foreach ($projects as $project) {
            $cutoff = new \DateTimeImmutable(sprintf('-%d days', $project->getRetentionDays()));

            $reports = $this->em->createQueryBuilder()
                ->select('r')
                ->from(Report::class, 'r')
                ->where('r.project = :project')
                ->andWhere('r.createdAt < :cutoff')
                ->setParameter('project', $project)
                ->setParameter('cutoff', $cutoff)
                ->getQuery()
                ->getResult();

            foreach ($reports as $report) {
                $this->attachmentManager->deleteAllForReport($report);
                $this->em->remove($report);
                $totalDeleted++;
            }
        }

        $this->em->flush();

        $io->success(sprintf('Purged %d expired report(s).', $totalDeleted));

        return Command::SUCCESS;
    }
}
