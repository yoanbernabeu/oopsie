<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Setting;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/v1/setup')]
class SetupController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator,
    ) {}

    #[Route('/status', methods: ['GET'])]
    public function status(): JsonResponse
    {
        $userCount = $this->em->getRepository(User::class)->count([]);

        return $this->json([
            'setupNeeded' => $userCount === 0,
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function setup(Request $request): JsonResponse
    {
        $userCount = $this->em->getRepository(User::class)->count([]);
        if ($userCount > 0) {
            return $this->json(['error' => 'Setup already completed.'], Response::HTTP_FORBIDDEN);
        }

        $data = $request->toArray();

        // Create admin user
        $user = new User();
        $user->setEmail($data['email'] ?? '');
        $user->setName($data['name'] ?? '');
        $user->setRoles(['ROLE_ADMIN']);

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password'] ?? ''));

        $this->em->persist($user);

        // Save instance name
        if (isset($data['instanceName'])) {
            $setting = new Setting();
            $setting->setKey('instance_name');
            $setting->setValue($data['instanceName']);
            $this->em->persist($setting);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Setup completed.',
            'user' => [
                'id' => $user->getId()->toRfc4122(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
            ],
        ], Response::HTTP_CREATED);
    }
}
