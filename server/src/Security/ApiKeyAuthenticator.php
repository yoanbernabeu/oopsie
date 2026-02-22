<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class ApiKeyAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('X-Oopsie-Key');
    }

    public function authenticate(Request $request): Passport
    {
        $apiKey = $request->headers->get('X-Oopsie-Key');

        $project = $this->em->getRepository(Project::class)->findOneBy(['apiKey' => $apiKey]);

        if (!$project) {
            throw new AuthenticationException('Invalid API key.');
        }

        // For API key auth, we don't have a user — use a system identifier
        return new SelfValidatingPassport(
            new UserBadge('api_key_' . $project->getId()->toRfc4122())
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_UNAUTHORIZED);
    }
}
