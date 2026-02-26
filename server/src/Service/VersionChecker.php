<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class VersionChecker
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private CacheInterface $cache,
        #[Autowire('%env(OOPSIE_VERSION)%')]
        private string $currentVersion,
    ) {
    }

    public function check(): array
    {
        $latestVersion = $this->cache->get('oopsie_latest_version', function (ItemInterface $item): ?string {
            $item->expiresAfter(86400); // 24 hours

            try {
                $response = $this->httpClient->request('GET', 'https://api.github.com/repos/yoanbernabeu/oopsie/releases/latest', [
                    'headers' => ['Accept' => 'application/vnd.github.v3+json'],
                    'timeout' => 5,
                ]);

                $data = $response->toArray(false);
                return $data['tag_name'] ?? null;
            } catch (\Throwable) {
                return null;
            }
        });

        return [
            'current' => $this->currentVersion,
            'latest' => $latestVersion,
            'updateAvailable' => $latestVersion !== null && version_compare(
                ltrim($latestVersion, 'v'),
                ltrim($this->currentVersion, 'v'),
                '>'
            ),
        ];
    }
}
