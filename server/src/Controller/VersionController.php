<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\VersionChecker;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class VersionController extends AbstractController
{
    #[Route('/api/v1/version', methods: ['GET'])]
    public function version(VersionChecker $versionChecker): JsonResponse
    {
        return $this->json($versionChecker->check());
    }
}
