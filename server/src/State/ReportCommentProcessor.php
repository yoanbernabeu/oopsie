<?php

declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Report;
use App\Entity\ReportComment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<ReportComment, ReportComment>
 */
class ReportCommentProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ReportComment
    {
        assert($data instanceof ReportComment);

        $report = $this->em->getRepository(Report::class)->find($uriVariables['reportId']);
        if ($report === null) {
            throw new \RuntimeException('Report not found.');
        }

        $data->setReport($report);
        $data->setAuthor($this->security->getUser());

        $this->em->persist($data);
        $this->em->flush();

        return $data;
    }
}
