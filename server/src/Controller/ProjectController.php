<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/projects')]
class ProjectController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    #[Route('/{id}/regenerate-key', methods: ['POST'])]
    public function regenerateKey(string $id): JsonResponse
    {
        $project = $this->em->getRepository(Project::class)->find($id);

        if (!$project) {
            return $this->json(['error' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $project->regenerateApiKey();
        $this->em->flush();

        return $this->json([
            'apiKey' => $project->getApiKey(),
        ]);
    }

    #[Route('/{id}/snippet', methods: ['GET'])]
    public function snippet(string $id): JsonResponse
    {
        $project = $this->em->getRepository(Project::class)->find($id);

        if (!$project) {
            return $this->json(['error' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $npm = sprintf(
            "import Oopsie from 'oopsie-sdk';\n\nOopsie.init({\n  serverUrl: '%s',\n  apiKey: '%s',\n});",
            '{{SERVER_URL}}',
            $project->getApiKey(),
        );

        $cdn = sprintf(
            "<script async src=\"https://cdn.oopsie.example.com/sdk/v1/oopsie.min.js\"></script>\n<script>\n  window.OopsieConfig = {\n    serverUrl: '%s',\n    apiKey: '%s',\n  };\n</script>",
            '{{SERVER_URL}}',
            $project->getApiKey(),
        );

        return $this->json([
            'npm' => $npm,
            'cdn' => $cdn,
        ]);
    }
}
